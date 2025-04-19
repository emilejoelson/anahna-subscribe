const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const { transformRestaurant } = require('./merge');

module.exports = {
  Query: {
    // Get all subcategories for a specific category
    subCategories: async (_, { categoryId }, context) => {
      console.log('Fetching subcategories for category:', categoryId);
      
      if (!categoryId) {
        console.log('Missing required parameter categoryId');
        throw new Error('categoryId is required');
      }
      
      try {
        const restaurants = await Restaurant.find({});
        
        // Look through all restaurants to find the category with matching ID
        for (const restaurant of restaurants) {
          for (const category of restaurant.categories) {
            if (category._id.toString() === categoryId) {
              return category.subCategories.map(subCat => ({
                _id: subCat._id,
                title: subCat.title,
                description: subCat.description || '',
                isActive: subCat.isActive,
                parentCategoryId: categoryId
              }));
            }
          }
        }
        
        console.log(`No categories found with ID: ${categoryId}`);
        return []; // Return empty array if no matching category found
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
      }
    },
    
    // Get subcategories by parent category ID and restaurant ID
    subCategoriesByParentId: async (_, args, context) => {
      // Support both parameter names for backward compatibility
      const parentId = args.parentId || args.parentCategoryId;
      
      console.log('Fetching subcategories for parentId:', parentId);
      
      if (!parentId) {
        // For debugging purposes, log what parameters were actually provided
        console.log('Missing required parameter. Received args:', JSON.stringify(args));
        throw new Error('Either parentId or parentCategoryId is required');
      }
      
      try {
        const restaurants = await Restaurant.find({});
        
        // Look through all restaurants to find the category with matching ID
        for (const restaurant of restaurants) {
          for (const category of restaurant.categories) {
            if (category._id.toString() === parentId) {
              return category.subCategories.map(subCat => ({
                _id: subCat._id,
                title: subCat.title,
                description: subCat.description || '',
                isActive: subCat.isActive,
                parentCategoryId: parentId
              }));
            }
          }
        }
        
        console.log(`No categories found with ID: ${parentId}`);
        return []; // Return empty array if no matching category found
      } catch (error) {
        console.error('Error fetching subcategories by parent ID:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    createCategory: async (_, { category }, context) => {
      console.log('Creating a new category with:', category);
      try {
        // 1. Verify restaurant exists
        const restaurant = await Restaurant.findById(category.restaurant);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        // 2. Prepare category data with explicit timestamps as strings
        const now = new Date().toISOString();
        const categoryData = {
          title: category.title.trim(),
          image: category.image || '',
          description: category.description || '',
          subCategories: [],
          isActive: true,
          createdAt: now,
          updatedAt: now
        };

        // 3. Handle subcategories if provided
        if (category.subCategories && Array.isArray(category.subCategories)) {
          // Filter out empty subcategories
          const validSubCategories = category.subCategories.filter(sub => 
            sub && sub.title && sub.title.trim() !== ''
          );
          
          // Only add valid subcategories if any exist
          if (validSubCategories.length > 0) {
            categoryData.subCategories = validSubCategories.map((sub) => ({
              title: sub.title.trim(),
              description: sub.description || '',
              isActive: sub.isActive !== false,
              createdAt: now,
              updatedAt: now
            }));
          }
          // We don't throw an error if no valid subcategories, just create the category without subcategories
        }

        // 4. Add new category to restaurant
        restaurant.categories.push(categoryData);
        await restaurant.save();

        return transformRestaurant(restaurant);
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },

    editCategory: async (_, { category }, context) => {
      console.log('Editing category:', category);
      try {
        const restaurant = await Restaurant.findById(category.restaurant);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        const categoryToUpdate = restaurant.categories.id(category._id);
        if (!categoryToUpdate) {
          throw new Error('Category not found');
        }

        // Mettre à jour les champs de base
        categoryToUpdate.title = category.title;
        if (category.image !== undefined) {
          categoryToUpdate.image = category.image;
        }

        // Mettre à jour les sous-catégories si fournies
        if (category.subCategories && Array.isArray(category.subCategories)) {
          categoryToUpdate.subCategories = category.subCategories.map((sub, index) => {
            if (!sub || !sub.title || sub.title.trim() === '') {
              throw new Error(`Sub-category at position ${index + 1} is missing a title`);
            }
            return {
              title: sub.title.trim(),
              description: sub.description || '',
              isActive: sub.isActive !== false
            };
          });
        }

        await restaurant.save();
        return transformRestaurant(restaurant);
      } catch (error) {
        console.error('Error editing category:', error);
        throw error;
      }
    },

    deleteCategory: async (_, { id, restaurant }, context) => {
      console.log('Deleting category:', id, 'from restaurant:', restaurant);
      try {
        const restaurantToUpdate = await Restaurant.findById(restaurant);
        if (!restaurantToUpdate) {
          throw new Error('Restaurant not found');
        }

        const categoryToDelete = restaurantToUpdate.categories.id(id);
        if (!categoryToDelete) {
          throw new Error('Category not found');
        }

        categoryToDelete.remove();
        await restaurantToUpdate.save();

        return transformRestaurant(restaurantToUpdate);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    },

    createSubCategories: async (_, { categoryId, restaurant: restaurantId, subCategories }, context) => {
      console.log('Adding subcategories to category:', categoryId);
      try {
        let restaurant;

        // If restaurantId is not provided, try to find the restaurant by looking up the category
        if (!restaurantId) {
          console.log('Restaurant ID not provided, searching for category across all restaurants');
          const restaurants = await Restaurant.find({});
          
          // Search for the category across all restaurants
          for (const rest of restaurants) {
            const category = rest.categories.id(categoryId);
            if (category) {
              restaurant = rest;
              console.log(`Found category in restaurant: ${restaurant._id}`);
              break;
            }
          }
          
          if (!restaurant) {
            throw new Error(`Could not find any restaurant containing category with ID: ${categoryId}`);
          }
        } else {
          // Find the restaurant by ID if provided
          restaurant = await Restaurant.findById(restaurantId);
          if (!restaurant) {
            throw new Error(`Restaurant not found with ID: ${restaurantId}`);
          }
        }

        // Find the specific category
        const category = restaurant.categories.id(categoryId);
        if (!category) {
          throw new Error(`Category not found with ID: ${categoryId}`);
        }

        // Validate and format subcategories
        const validSubCategories = subCategories.map((sub, index) => {
          if (!sub || !sub.title || sub.title.trim() === '') {
            throw new Error(`Sub-category at position ${index + 1} is missing a title`);
          }
          return {
            title: sub.title.trim(),
            description: sub.description || '',
            isActive: sub.isActive !== false,
            parentCategoryId: categoryId
          };
        });

        // Add new subcategories to existing ones
        category.subCategories = [
          ...(category.subCategories || []),
          ...validSubCategories
        ];

        await restaurant.save();
        
        // Return transformed restaurant with all needed fields
        return transformRestaurant(restaurant);
      } catch (error) {
        console.error('Error creating subcategories:', error);
        throw error;
      }
    },
  },
};
