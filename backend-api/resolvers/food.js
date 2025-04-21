const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const Variation = require('../models/variation');
const { transformRestaurant } = require('./merge');
const mongoose = require('mongoose');

module.exports = {
  Mutation: {
    createFood: async (_, args, context) => {
      console.log('Creating food item with arguments:', args);
      const { 
        restaurant: restId, 
        category: categoryId, 
        variations: foodVariations, 
        title, 
        description, 
        image, 
        _id: foodId, 
        isOutOfStock, 
        isActive,
        subCategory 
      } = args.foodInput;

      // Always require a restaurant ID
      if (!restId) {
        throw new Error('Restaurant ID is required');
      }

      try {
        // Check if food variations exist
        if (!foodVariations || foodVariations.length === 0) {
          throw new Error('At least one variation is required');
        }

        // Format variations for storing directly in the restaurant document
        const variations = foodVariations.map(variation => ({
          _id: variation._id || new mongoose.Types.ObjectId(),
          title: variation.title || 'Default Variation',
          price: variation.price,
          discounted: variation.discounted || null,
          addons: variation.addons || [],
          isOutOfStock: variation.isOutOfStock !== undefined ? variation.isOutOfStock : false
        }));
        
        // If the _id is empty string or null, it's a new item (create)
        if (!foodId || foodId === '') {
          // Create a placeholder title if not provided
          const foodTitle = title || 'New Food Item';
          
          // Create a food document for embedding
          const foodDoc = {
            _id: new mongoose.Types.ObjectId(),
            title: foodTitle,
            description: description || '',
            image: image || '',
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false,
            isActive: isActive !== undefined ? isActive : true,
            subCategory: subCategory || '',
            variations: variations,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // If category not provided, find first available category
          if (!categoryId) {
            const restaurant = await Restaurant.findOne({ _id: restId });
            if (!restaurant) {
              throw new Error('Restaurant not found');
            }
            
            if (!restaurant.categories || restaurant.categories.length === 0) {
              throw new Error('Restaurant has no categories. Please create a category first.');
            }
            
            // Add food to the first category
            restaurant.categories[0].foods.push(foodDoc);
            const savedRestaurant = await restaurant.save();
            
            return transformRestaurant(savedRestaurant);
          } else {
            // Use the specified category
            // Update using updateOne to avoid race conditions
            const result = await Restaurant.updateOne(
              { _id: restId, 'categories._id': categoryId },
              { $push: { 'categories.$.foods': foodDoc } }
            );

            if (result.matchedCount === 0) {
              throw new Error(`Restaurant or category not found`);
            }
            
            const updatedRestaurant = await Restaurant.findById(restId);
            return transformRestaurant(updatedRestaurant);
          }
        } else {
          // If _id is provided, it's an edit
          return module.exports.Mutation.editFood(_, args, context);
        }
      } catch (err) {
        console.error('Error creating food item:', err);
        throw err; // Propagate the actual error message
      }
    },

    editFood: async (_, args, context) => {
      console.log('Editing food item with arguments:', args);
      const { 
        _id: foodId, 
        restaurant: restId, 
        category: categoryId, 
        variations: foodVariations, 
        title, 
        description, 
        image,
        isOutOfStock,
        isActive,
        subCategory 
      } = args.foodInput;

      if (!restId) {
        throw new Error('Restaurant ID is required');
      }

      if (!foodVariations || foodVariations.length === 0) {
        throw new Error('At least one variation is required');
      }

      // Ensure title is provided - this is a required field in the model
      if (!title) {
        throw new Error('Food title is required');
      }

      try {
        const restaurant = await Restaurant.findOne({ _id: restId });
        if (!restaurant) throw new Error('Restaurant not found');

        // Process variations for the embedded document
        const variations = foodVariations.map(variation => ({
          _id: variation._id || new mongoose.Types.ObjectId(),
          title: variation.title || 'Default Variation',
          price: variation.price,
          discounted: variation.discounted || null,
          addons: variation.addons || [],
          isOutOfStock: variation.isOutOfStock !== undefined ? variation.isOutOfStock : false
        }));

        // Find category containing the food item
        let containingCategory = null;
        let foodIndex = -1;
        
        for (const cat of restaurant.categories) {
          for (let i = 0; i < cat.foods.length; i++) {
            if (cat.foods[i]._id.toString() === foodId) {
              containingCategory = cat;
              foodIndex = i;
              break;
            }
          }
          if (containingCategory) break;
        }

        // If we're moving to a new category or the food doesn't exist in any category
        if (categoryId && (!containingCategory || !containingCategory._id.equals(categoryId))) {
          // Remove from previous category if necessary
          if (containingCategory && foodIndex !== -1) {
            containingCategory.foods.splice(foodIndex, 1);
          }

          // Create updated food document - ensure title is always present
          const updatedFoodDoc = {
            _id: mongoose.Types.ObjectId(foodId),
            title: title, // Required field - no fallback now since we validate above
            description: description || '',
            image: image || '',
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false,
            isActive: isActive !== undefined ? isActive : true,
            subCategory: subCategory || '',
            variations: variations,
            updatedAt: new Date()
          };

          // Find target category and add food to it
          const targetCategoryIndex = restaurant.categories.findIndex(
            cat => cat._id.toString() === categoryId
          );

          if (targetCategoryIndex === -1) {
            throw new Error(`Category with ID ${categoryId} not found`);
          }

          restaurant.categories[targetCategoryIndex].foods.push(updatedFoodDoc);
          const result = await restaurant.save();
          return transformRestaurant(result);
        } else {
          // Edit food item in the existing category
          if (!containingCategory || foodIndex === -1) {
            throw new Error('Food item not found in any category');
          }
          
          // Update the existing food item - ensure title is always present
          const existingFood = containingCategory.foods[foodIndex];
          existingFood.title = title; // Required field - no fallback now since we validate above
          existingFood.description = description !== undefined ? description : existingFood.description;
          existingFood.image = image !== undefined ? image : existingFood.image;
          existingFood.variations = variations;
          existingFood.isOutOfStock = isOutOfStock !== undefined ? isOutOfStock : existingFood.isOutOfStock;
          existingFood.isActive = isActive !== undefined ? isActive : existingFood.isActive;
          existingFood.subCategory = subCategory !== undefined ? subCategory : existingFood.subCategory;
          existingFood.updatedAt = new Date();
          
          const result = await restaurant.save();
          return transformRestaurant(result);
        }
      } catch (err) {
        console.error('Error editing food item:', err);
        throw err; // Propagate the actual error message
      }
    },

    deleteFood: async (_, { id, restaurant: restId, categoryId }, context) => {
      console.log('Deleting food item with ID:', id, 'from category:', categoryId, 'in restaurant:', restId);
      try {
        // Validate inputs
        if (!id || !restId || !categoryId) {
          throw new Error('Food ID, restaurant ID, and category ID are all required');
        }

        // Find the restaurant
        const restaurant = await Restaurant.findById(restId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restId} not found`);
        }

        // Find the category by ID
        const categoryIndex = restaurant.categories.findIndex(
          cat => cat._id.toString() === categoryId
        );
        
        if (categoryIndex === -1) {
          throw new Error(`Category with ID ${categoryId} not found in restaurant ${restId}`);
        }
        
        // First, fix any existing foods without title - add a title to prevent validation errors
        restaurant.categories.forEach(category => {
          if (category.foods && Array.isArray(category.foods)) {
            category.foods.forEach(food => {
              if (!food.title) {
                console.log(`Setting default title for food ${food._id}`);
                food.title = 'Untitled Food';
              }
            });
          }
        });
        
        // Find the food item by ID in the category
        const category = restaurant.categories[categoryIndex];
        const foodIndex = category.foods.findIndex(
          food => food._id.toString() === id
        );
        
        if (foodIndex === -1) {
          throw new Error(`Food item with ID ${id} not found in category ${categoryId}`);
        }
        
        // Remove the food item
        category.foods.splice(foodIndex, 1);
        
        // Save with validation bypass option if needed
        // Use updateOne to bypass validation and directly update the document
        const updateResult = await Restaurant.updateOne(
          { _id: restId },
          { $set: { categories: restaurant.categories } }
        );
        
        if (updateResult.modifiedCount === 0) {
          throw new Error('Failed to update restaurant after removing food item');
        }
        
        console.log(`Successfully deleted food ${id} from category ${categoryId}`);
        
        // Fetch the latest restaurant data
        const updatedRestaurant = await Restaurant.findById(restId);
        return transformRestaurant(updatedRestaurant);
      } catch (err) {
        console.error('Error deleting food item:', err);
        // Return the specific error message instead of generic one
        throw new Error(`Failed to delete food item: ${err.message}`);
      }
    },

    updateFoodOutOfStock: async (_, { id, restaurant: restId, categoryId }, context) => {
      console.log('Toggling food out-of-stock status with ID:', id, 'in category:', categoryId, 'in restaurant:', restId);
      try {
        // Validate inputs
        if (!id || !restId || !categoryId) {
          throw new Error('Food ID, restaurant ID, and category ID are all required');
        }

        // Find the restaurant
        const restaurant = await Restaurant.findById(restId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restId} not found`);
        }

        // Find the category by ID
        const categoryIndex = restaurant.categories.findIndex(
          cat => cat._id.toString() === categoryId
        );
        
        if (categoryIndex === -1) {
          throw new Error(`Category with ID ${categoryId} not found in restaurant ${restId}`);
        }
        
        // Find the food item by ID in the category
        const category = restaurant.categories[categoryIndex];
        const foodIndex = category.foods.findIndex(
          food => food._id.toString() === id
        );
        
        if (foodIndex === -1) {
          throw new Error(`Food item with ID ${id} not found in category ${categoryId}`);
        }
        
        // Toggle the isOutOfStock status
        const foodItem = category.foods[foodIndex];
        foodItem.isOutOfStock = !foodItem.isOutOfStock;
        
        // Use updateOne to bypass validation and directly update the document
        const updateResult = await Restaurant.updateOne(
          { 
            _id: restId,
            'categories._id': categoryId,
            'categories.foods._id': mongoose.Types.ObjectId(id)
          },
          { 
            $set: { 
              'categories.$[category].foods.$[food].isOutOfStock': foodItem.isOutOfStock,
              'categories.$[category].foods.$[food].updatedAt': new Date()
            } 
          },
          {
            arrayFilters: [
              { 'category._id': mongoose.Types.ObjectId(categoryId) },
              { 'food._id': mongoose.Types.ObjectId(id) }
            ]
          }
        );
        
        if (updateResult.modifiedCount === 0) {
          throw new Error('Failed to update food out-of-stock status');
        }
        
        console.log(`Successfully updated food ${id} out-of-stock status to ${foodItem.isOutOfStock}`);
        
        // Return the new out-of-stock status
        return foodItem.isOutOfStock;
      } catch (err) {
        console.error('Error updating food out-of-stock status:', err);
        throw new Error(`Failed to update food out-of-stock status: ${err.message}`);
      }
    }
  }
};
