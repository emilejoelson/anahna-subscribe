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
    
      try {
        const food = await Food.findById(foodId);
        if (!food) {
          throw new Error('Food not found');
        }
    
        // 1. Vérifie si le categoryId a changé (déplacement entre catégories)
        if (food.category.toString() !== categoryId) {
          const oldCategory = await Category.findById(food.category);
          const newCategory = await Category.findById(categoryId);
    
          if (!oldCategory || !newCategory) {
            throw new Error('Old or new category not found');
          }
    
          // Retire le food de l'ancienne catégorie
          oldCategory.foods = oldCategory.foods.filter(fId => fId.toString() !== foodId);
          await oldCategory.save();
    
          // Ajoute le food à la nouvelle catégorie
          newCategory.foods.push(food._id);
          await newCategory.save();
    
          food.category = categoryId;
        }
    
        // 2. Met à jour les variations
        const updatedVariationIds = [];
        for (const variation of foodVariations) {
          if (variation._id) {
            // Mise à jour d'une variation existante
            await Variation.findByIdAndUpdate(variation._id, {
              $set: {
                title: variation.title,
                price: variation.price,
                discounted: variation.discounted || 0,
                addons: variation.addons || [],
                isOutOfStock: variation.isOutOfStock !== undefined ? variation.isOutOfStock : false
              }
            });
            updatedVariationIds.push(variation._id);
          } else {
            // Nouvelle variation
            const newVariation = new Variation({
              title: variation.title,
              price: variation.price,
              discounted: variation.discounted || 0,
              addons: variation.addons || [],
              isOutOfStock: variation.isOutOfStock || false,
              food: foodId,
              isActive: true
            });
            const savedVariation = await newVariation.save();
            updatedVariationIds.push(savedVariation._id);
          }
        }
    
        // 3. Met à jour le food lui-même
        food.title = title || food.title;
        food.description = description !== undefined ? description : food.description;
        food.image = image !== undefined ? image : food.image;
        food.variations = updatedVariationIds;
        food.isOutOfStock = isOutOfStock !== undefined ? isOutOfStock : food.isOutOfStock;
        food.isActive = isActive !== undefined ? isActive : food.isActive;
        food.subCategory = subCategory !== undefined ? subCategory : food.subCategory;
        food.updatedAt = new Date();
    
        await food.save();
    
        // 4. Renvoie le restaurant transformé
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
    
        return transformRestaurant(restaurant);
    
      } catch (err) {
        console.error('Error editing food item:', err);
        throw err;
      }
    },  
    deleteFood: async (_, { id, restaurant: restId, categoryId }, context) => {
      console.log('Deleting food item with ID:', id);
      try {
        // 1. Vérifie si le restaurant existe
        const restaurant = await Restaurant.findById(restId);
        if (!restaurant) throw new Error('Restaurant not found');
    
        // 2. Vérifie si la catégorie contient bien ce food
        const category = await Category.findById(categoryId);
        if (!category) throw new Error('Category not found');
    
        // 3. Supprime la référence au food dans la catégorie
        category.foods = category.foods.filter(foodId => foodId.toString() !== id);
        await category.save();
    
        // 4. Supprime les variations liées à ce food
        await Variation.deleteMany({ food: id });
    
        // 5. Supprime le food lui-même
        await Food.findByIdAndDelete(id);
    
        // 6. Renvoie le restaurant mis à jour
        const updatedRestaurant = await Restaurant.findById(restId).populate({
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
    
        return transformRestaurant(updatedRestaurant);
      } catch (err) {
        console.error('Error deleting food item:', err);
        throw new Error('Failed to delete food item');
      }
    }    
  }
};
