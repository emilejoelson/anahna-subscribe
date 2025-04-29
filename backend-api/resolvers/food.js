const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const Variation = require('../models/variation');
const Category = require('../models/category');
const { transformRestaurant } = require('./merge');
const mongoose = require('mongoose');

module.exports = {
  Mutation: {
    updateFoodOutOfStock: async (_, { id, restaurant, categoryId }) => {
      try {
        // 1. Trouver le restaurant
        const restaurantDoc = await Restaurant.findOne({
          _id: restaurant,
          categories: categoryId
        });
    
        if (!restaurantDoc) return false;
    
        // 2. Vérifier que le food appartient à ce category
        const categoryDoc = await Category.findOne({
          _id: categoryId,
          foods: id
        });
    
        if (!categoryDoc) return false;
    
        // 3. Récupérer le food pour lire son état actuel
        const foodDoc = await Food.findById(id);
    
        if (!foodDoc) return false;
        
        // 4. Mettre à jour le champ `isOutOfStock`
        foodDoc.isOutOfStock = !foodDoc.isOutOfStock;
        await foodDoc.save();
    
        return true;
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
    
      if (!restId) {
        throw new Error('Restaurant ID is required');
      }
    
      try {

        if (!foodId || foodId === '') {
          if (!foodVariations || foodVariations.length === 0) {
            throw new Error('At least one variation is required');
          }
      
          // 1. Create Variation
          const createdVariations = [];
          for (const variation of foodVariations) {
            const newVariation = new Variation({
              title: variation.title,
              price: variation.price,
              discounted: variation.discounted || 0,
              addons: variation.addons || [],
              isOutOfStock: variation.isOutOfStock !== undefined ? variation.isOutOfStock : false,
              food: null, // will be updated later
              isActive: true,
            });
            const savedVariation = await newVariation.save();
            createdVariations.push(savedVariation);
          }
      
          // 2. Create food with IDs of Variations
          const foodDoc = new Food({
            title: title.trim(),
            description: description || '',
            image: image || '',
            // price: createdVariations[0].price, 
            restaurant: restId,
            category: categoryId,
            subCategory: subCategory || null,
            variations: createdVariations.map(v => v._id),
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false,
            isActive: isActive,
          });
      
          const savedFood = await foodDoc.save();
      
          // 3. Add Food ref to Variations
          await Variation.updateMany(
            { _id: { $in: createdVariations.map(v => v._id) } },
            { $set: { food: savedFood._id } }
          );

          // 4. Add Food to Category
          const category = await Category.findById(categoryId);
          if (!category) throw new Error('Category not found');

          category.foods.push(savedFood._id);
          await category.save();

          const restaurant = await Restaurant.findById(restId).populate({
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
          if (!restaurant) throw new Error('Restaurant not found');  
          
          return transformRestaurant(restaurant);
        } else {
          // If _id is provided, it's an edit
          return module.exports.Mutation.editFood(_, args, context);
        }
      } catch (err) {
        console.error('Error creating food item:', err);
        throw err;
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
