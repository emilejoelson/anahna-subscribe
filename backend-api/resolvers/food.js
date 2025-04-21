const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const Variation = require('../models/variation');
const { transformRestaurant } = require('./merge');

module.exports = {
  Mutation: {
    createFood: async (_, args, context) => {
      console.log('Creating food item with arguments:', args);
      const { restaurant: restId, category: categoryId, variations: foodVariations, title, description, image, _id: foodId, isOutOfStock, isActive } = args.foodInput;

      // Always require a restaurant ID
      if (!restId) {
        throw new Error('Restaurant ID is required');
      }

      try {
        // Check if food variations exist
        if (!foodVariations || foodVariations.length === 0) {
          throw new Error('At least one variation is required');
        }

        const variations = foodVariations.map(variation => new Variation(variation));
        
        // If the _id is empty string or null, it's a new item (create)
        if (!foodId || foodId === '') {
          // Create a placeholder title if not provided - ALWAYS SET A TITLE
          const foodTitle = title || 'New Food Item';
          
          const food = new Food({
            title: foodTitle, // Ensure title is never null or empty
            variations,
            description: description || '',
            image: image || '',
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false,
            isActive: isActive !== undefined ? isActive : true
          });

          // If category not provided, try to find the first available category
          if (!categoryId) {
            const restaurant = await Restaurant.findOne({ _id: restId });
            if (!restaurant) {
              throw new Error('Restaurant not found');
            }
            
            if (!restaurant.categories || restaurant.categories.length === 0) {
              throw new Error('Restaurant has no categories. Please create a category first.');
            }
            
            // Use the first category
            const firstCategory = restaurant.categories[0];
            
            // Add food to the first category
            firstCategory.foods.push(food);
            const savedRestaurant = await restaurant.save();
            
            return await transformRestaurant(savedRestaurant);
          } else {
            // Use the specified category
            const restaurant = await Restaurant.findOne({ _id: restId });
            if (!restaurant) {
              throw new Error('Restaurant not found');
            }
            
            const category = restaurant.categories.id(categoryId);
            if (!category) {
              throw new Error(`Category with ID ${categoryId} not found`);
            }
            
            // Add directly to the category
            category.foods.push(food);
            const savedRestaurant = await restaurant.save();
            
            return await transformRestaurant(savedRestaurant);
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
      const { _id: foodId, restaurant: restId, category: categoryId, variations: foodVariations, title, description, image } = args.foodInput;

      if (!restId) {
        throw new Error('Restaurant ID is required');
      }

      if (!foodVariations || foodVariations.length === 0) {
        throw new Error('At least one variation is required');
      }

      const variations = foodVariations.map(variation => new Variation(variation));

      try {
        const restaurant = await Restaurant.findOne({ _id: restId });
        if (!restaurant) throw new Error('Restaurant not found');

        // Find category containing the food item (if any)
        let containingCategory = null;
        for (const cat of restaurant.categories) {
          if (cat.foods.id(foodId)) {
            containingCategory = cat;
            break;
          }
        }

        // If we're moving to a new category or the food doesn't exist in any category
        if (categoryId && (!containingCategory || !containingCategory._id.equals(categoryId))) {
          // Remove from previous category if necessary
          if (containingCategory) {
            containingCategory.foods.id(foodId).remove();
            await restaurant.save();
          }

          // Add to new category
          const food = new Food({
            title: title || 'New Food Item', 
            variations,
            description: description || '',
            image: image || ''
          });

          // Ensure the target category exists
          const targetCategory = restaurant.categories.id(categoryId);
          if (!targetCategory) {
            throw new Error(`Category with ID ${categoryId} not found`);
          }

          await Restaurant.updateOne(
            { _id: restId, 'categories._id': categoryId },
            { $push: { 'categories.$.foods': food } }
          );

          const latestRest = await Restaurant.findOne({ _id: restId });
          return await transformRestaurant(latestRest);
        } else {
          // Edit food item in the existing category (if category not specified, use the containing one)
          const effectiveCategoryId = categoryId || (containingCategory ? containingCategory._id : null);
          
          if (!effectiveCategoryId) {
            throw new Error('Category ID is required when editing a food item that does not exist in any category');
          }
          
          const categoryFood = restaurant.categories.id(effectiveCategoryId).foods.id(foodId);
          
          if (categoryFood) {
            categoryFood.set({
              title: title || categoryFood.title,
              description: description !== undefined ? description : categoryFood.description,
              image: image !== undefined ? image : categoryFood.image,
              variations
            });
            
            const result = await restaurant.save();
            return transformRestaurant(result);
          } else {
            throw new Error('Food item not found in category');
          }
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
