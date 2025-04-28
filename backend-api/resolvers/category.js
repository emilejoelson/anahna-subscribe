const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const Restaurant = require("../models/restaurant");
const { transformRestaurant } = require("./merge");
const mongoose = require('mongoose');
module.exports = {
  Query: {
    // Get all subcategories for a specific category
    GetSubCategoriesByParentId: async (_, { parentCategoryId }, context) => {
      console.log("Fetching subcategories for category:", parentCategoryId);

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
          parentCategoryId: parentCategoryId,
        }));
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
    },
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
      try {
        console.log('Creating a new category with:', category);
    
        // 1. Verify restaurant exists
        const restaurant = await Restaurant.findById(category.restaurant).populate({
          path: 'categories',
          populate: {
            path: 'foods',
            populate: {
              path: 'variations',
              populate: {
                path: 'addons'
              }
            }
          }
        });
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
    
        // 2. Prepare initial category data
        const categoryData = {
          title: category.title.trim(),
          image: category.image || '',
          description: category.description || '',
          isActive: true,
          restaurant: restaurant._id, 
          subCategories: [] // Will be populated after
        };
    
        const newCategory = new Category(categoryData);
    
        // 3. Handle subcategories if provided
        if (category.subCategories && Array.isArray(category.subCategories)) {
          const validSubCategories = category.subCategories.filter(sub => 
            sub && sub.title && sub.title.trim() !== ''
          );
    
          if (validSubCategories.length > 0) {
            const subCategoryIds = [];
    
            for (const sub of validSubCategories) {
              const newSubCategory = new SubCategory({
                title: sub.title.trim(),
                description: sub.description || '',
                parentCategoryId: newCategory._id // Link subcategory to parent category
              });
    
              await newSubCategory.save();
              subCategoryIds.push(newSubCategory._id);
            }
    
            newCategory.subCategories = subCategoryIds;
          }
        }
    
        // 4. Save the new category with updated subcategories
        await newCategory.save();
    
        // 5. Add new category to restaurant's categories
        restaurant.categories.push(newCategory._id);
        await restaurant.save();
    
        // 6. Return updated restaurant
        return transformRestaurant(restaurant);
    
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },   
    editCategory: async (_, { category }, context) => {
      try {
        console.log('Editing category:', category);
        // 1. find category
        const categoryToUpdate = await Category.findById(category._id);
        if (!categoryToUpdate) {
          throw new Error('Category not found');
        }
    
        // 2. edit category details
        categoryToUpdate.title = category.title.trim();
        if (category.image !== undefined) {
          categoryToUpdate.image = category.image;
        }
        if (category.description !== undefined) {
          categoryToUpdate.description = category.description.trim();
        }
    
        // 3. subcategories
        if (category.subCategories && Array.isArray(category.subCategories)) {
          // delete existing subcategories
          await SubCategory.deleteMany({ parentCategoryId: categoryToUpdate._id });
    
          const validSubCategories = category.subCategories.filter(sub =>
            sub && sub.title && sub.title.trim() !== ''
          );
    
          const newSubCategoryIds = [];
    
          for (const sub of validSubCategories) {
            const newSubCategory = new SubCategory({
              title: sub.title.trim(),
              description: sub.description || '',
              parentCategoryId: categoryToUpdate._id
            });
    
            await newSubCategory.save();
            newSubCategoryIds.push(newSubCategory._id);
          }
    
          // edit category subcategories
          categoryToUpdate.subCategories = newSubCategoryIds;
        }
    
        await categoryToUpdate.save();
    
        const restaurant = await Restaurant.findById(category.restaurant).populate({
          path: 'categories',
          populate: {
            path: 'foods',
            populate: {
              path: 'variations',
              populate: {
                path: 'addons'
              }
            }
          }
        });
        return transformRestaurant(restaurant);
        
      } catch (error) {
        console.error('Error editing category:', error);
        throw error;
      }
    },
    deleteCategory: async (_, { id, restaurant }, context) => {
      try {
        console.log('Deleting category:', id, 'from restaurant:', restaurant);
        // 1. find restaurant
        const restaurantToUpdate = await Restaurant.findById(restaurant).populate({
          path: 'categories',
          populate: {
            path: 'foods',
            populate: {
              path: 'variations',
              populate: {
                path: 'addons'
              }
            }
          }
        });
        if (!restaurantToUpdate) {
          throw new Error('Restaurant not found');
        }
    
        // 2. find category
        const categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
          throw new Error('Category not found');
        }
    
        // 3. delete subcategories
        await SubCategory.deleteMany({ parentCategoryId: id });
    
        // 4. delete category
        await Category.findByIdAndDelete(id);
    
        // 5. remove from restaurant categories
        restaurantToUpdate.categories = restaurantToUpdate.categories.filter(
          (categoryId) => !categoryId.equals(id)
        );
    
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
