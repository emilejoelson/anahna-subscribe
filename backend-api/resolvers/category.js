const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const Restaurant = require("../models/restaurant");
const { transformRestaurant } = require("./merge");
const mongoose = require('mongoose');
module.exports = {
  Query: {
    // Get all subcategories for a specific category
    subCategories: async (_, { categoryId }, context) => {
      console.log("Fetching subcategories for category:", categoryId);

      if (!categoryId) {
        console.log("Missing required parameter categoryId");
        throw new Error("categoryId is required");
      }

      try {
        const restaurant = await Restaurant.findOne({
          "categories._id": categoryId
        });

        if (!restaurant) {
          console.log(`No restaurant found with category ID: ${categoryId}`);
          return [];
        }

        const category = restaurant.categories.id(categoryId);
        if (!category) {
          console.log(`No category found with ID: ${categoryId}`);
          return [];
        }

        return category.subCategories.map((subCat) => ({
          _id: subCat._id,
          title: subCat.title,
          description: subCat.description || "",
          isActive: subCat.isActive,
          parentCategoryId: categoryId,
        }));
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
    },
    subCategory: async (_, { _id }, context) => {
      console.log("Fetching subcategory with ID:", _id);

      if (!_id) {
        console.log("Missing required parameter _id");
        throw new Error("_id is required");
      }

      try {
        const restaurant = await Restaurant.findOne({
          "categories.subCategories._id": _id
        });

        if (!restaurant) {
          console.log(`No restaurant found with subcategory ID: ${_id}`);
          return null;
        }

        // Find the category containing this subcategory
        for (const category of restaurant.categories) {
          const subCategory = category.subCategories.id(_id);
          if (subCategory) {
            return {
              _id: subCategory._id,
              title: subCategory.title,
              description: subCategory.description || "",
              isActive: subCategory.isActive,
              parentCategoryId: category._id,
            };
          }
        }

        console.log(`No subcategory found with ID: ${_id}`);
        return null;
      } catch (error) {
        console.error("Error fetching subcategory:", error);
        throw error;
      }
    },
    // Get subcategories by parent category ID and restaurant ID
    subCategoriesByParentId: async (_, args, context) => {
      const parentCategoryId = args.parentCategoryId;

      console.log("Fetching subcategories for parentId:", parentCategoryId);

      if (!parentCategoryId) {
        console.log("Missing required parameter parentCategoryId");
        throw new Error("parentCategoryId is required");
      }

      try {
        const restaurant = await Restaurant.findOne({
          "categories._id": parentCategoryId
        });

        if (!restaurant) {
          console.log(`No restaurant found with category ID: ${parentCategoryId}`);
          return [];
        }

        const category = restaurant.categories.id(parentCategoryId);
        if (!category) {
          console.log(`No category found with ID: ${parentCategoryId}`);
          return [];
        }

        return category.subCategories.map((subCat) => ({
          _id: subCat._id,
          title: subCat.title,
          description: subCat.description || "",
          isActive: subCat.isActive,
          parentCategoryId: parentCategoryId,
        }));
      } catch (error) {
        console.error("Error fetching subcategories by parent ID:", error);
        throw error;
      }
    },
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

    createSubCategories: async (_, { subCategories }) => {
      console.log("Creating subcategories:", subCategories);
      
      try {
        const results = [];
        
        for (const subCategoryInput of subCategories) {
          const parentCategoryId = subCategoryInput.parentCategoryId;
          
          // Find the restaurant containing the parent category
          const restaurant = await Restaurant.findOne({
            "categories._id": parentCategoryId
          });
          
          if (!restaurant) {
            throw new Error(`Parent category not found: ${parentCategoryId}`);
          }
          
          // Find the category within the restaurant
          const category = restaurant.categories.id(parentCategoryId);
          if (!category) {
            throw new Error(`Category not found with ID: ${parentCategoryId}`);
          }
          
          // Create new subcategory
          const newSubCategory = {
            _id: new mongoose.Types.ObjectId(),
            title: subCategoryInput.title,
            description: "",
            isActive: true
          };
          
          // Add to subcategories array
          category.subCategories.push(newSubCategory);
          
          // Save restaurant document
          await restaurant.save();
          
          // Add the new subcategory ID to results
          results.push(newSubCategory._id);
        }
        
        return results;
      } catch (error) {
        console.error('Error creating subcategories:', error);
        throw new Error(`Could not create subcategories: ${error.message}`);
      }
    },
  },
};
