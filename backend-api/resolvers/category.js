const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const { transformRestaurant } = require('./merge');

module.exports = {
  Query: {
    // Get all subcategories from all restaurants
    subCategories: async (_, __, context) => {
      try {
        const restaurants = await Restaurant.find({}, 'categories.subCategories');
        const allSubCategories = [];
        
        restaurants.forEach(restaurant => {
          restaurant.categories.forEach(category => {
            if (category.subCategories && Array.isArray(category.subCategories)) {
              category.subCategories.forEach(subCat => {
                allSubCategories.push({
                  _id: subCat._id,
                  title: subCat.title,
                  description: subCat.description || '',
                  isActive: subCat.isActive
                });
              });
            }
          });
        });
        
        return allSubCategories;
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
      }
    },
    
    // Get subcategories by parent category ID and restaurant ID
    subCategoriesByParentId: async (_, { categoryId, restaurant: restaurantId }, context) => {
      console.log('Fetching subcategories for categoryId:', categoryId, 'in restaurant:', restaurantId);
      try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        
        const category = restaurant.categories.id(categoryId);
        if (!category) {
          throw new Error('Category not found');
        }
        
        return category.subCategories.map(subCat => ({
          _id: subCat._id,
          title: subCat.title,
          description: subCat.description || '',
          isActive: subCat.isActive
        }));
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
        // Find the restaurant
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        // Find the specific category
        const category = restaurant.categories.id(categoryId);
        if (!category) {
          throw new Error('Category not found');
        }

        // Validate and format subcategories
        const validSubCategories = subCategories.map((sub, index) => {
          if (!sub || !sub.title || sub.title.trim() === '') {
            throw new Error(`Sub-category at position ${index + 1} is missing a title`);
          }
          return {
            title: sub.title.trim(),
            description: sub.description || '',
            isActive: sub.isActive !== false
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
