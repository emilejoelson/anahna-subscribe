const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const Variation = require('../models/variation');
const { transformRestaurant } = require('./merge');
const mongoose = require('mongoose');

module.exports = {
  Mutation: {
    updateFoodOutOfStock: async (_, { id, restaurant, categoryId }) => {
      try {
        // 1. Trouver le restaurant
        const restaurantDoc = await Restaurant.findOne({
          _id: restaurant,
          'categories._id': categoryId,
          'categories.foods._id': id
        });
    
        if (!restaurantDoc) return false;
    
        // 2. Trouver la catégorie et le plat
        const category = restaurantDoc.categories.find(cat => cat._id.toString() === categoryId);
        const food = category?.foods.find(fd => fd._id.toString() === id);
    
        if (!food) return false;
    
        // 3. Inverser la valeur actuelle
        const newOutOfStockValue = !food.isOutOfStock;
    
        // 4. Mettre à jour dans Mongo
        const updated = await Restaurant.updateOne(
          {
            _id: restaurant,
            'categories._id': categoryId,
            'categories.foods._id': id
          },
          {
            $set: {
              'categories.$[cat].foods.$[food].isOutOfStock': newOutOfStockValue
            }
          },
          {
            arrayFilters: [
              { 'cat._id': categoryId },
              { 'food._id': id }
            ]
          }
        );
    
        return updated.modifiedCount > 0;
      } catch (error) {
        console.error(error);
        return false;
      }
    },    
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

          // Create updated food document
          const updatedFoodDoc = {
            _id: mongoose.Types.ObjectId(foodId),
            title: title || 'New Food Item',
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
          
          // Update the existing food item
          const existingFood = containingCategory.foods[foodIndex];
          existingFood.title = title || existingFood.title;
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
      console.log('Deleting food item with ID:', id);
      try {
        const restaurant = await Restaurant.findOne({ _id: restId });
        if (!restaurant) throw new Error('Restaurant not found');

        restaurant.categories.id(categoryId).foods.id(id).remove();
        const result = await restaurant.save();
        return await transformRestaurant(result);
      } catch (err) {
        console.error('Error deleting food item:', err);
        throw new Error('Failed to delete food item');
      }
    }
  }
};
