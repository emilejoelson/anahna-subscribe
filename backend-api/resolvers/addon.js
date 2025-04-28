const Addon = require('../models/addon');
const Option = require('../models/option');
const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');
const { transformAddon, transformRestaurant } = require('./merge');

module.exports = {
  Query: {
    addons: async (_, { restaurantId } = {}) => {
      console.log('Fetching addons');
      try {
        // Build query with optional restaurant filter
        const query = { isActive: true };
        if (restaurantId) {
          query.restaurant = restaurantId;
        }
        
        const activeAddons = await Addon.find(query).populate('options');
        
        if (!activeAddons || activeAddons.length === 0) {
          console.log('No active addons found');
          // Return empty array instead of throwing error
          return [];
        }
        
        console.log(`Found ${activeAddons.length} active addons`);
        return activeAddons.map(addon => {
          // Ensure all required fields exist with default values if missing
          return {
            ...transformAddon(addon),
            quantityMinimum: addon.quantityMinimum ?? 0,
            quantityMaximum: addon.quantityMaximum ?? 1
          };
        });
      } catch (error) {
        console.error('Error fetching addons:', error);
        // Log error but return empty array to prevent UI crashes
        return [];
      }
    },
    addonsByRestaurant: async (_, { restaurantId }) => {
      console.log(`Fetching addons for restaurant: ${restaurantId}`);
      try {
        if (!restaurantId) {
          throw new Error('Restaurant ID is required');
        }
        
        // Combined approach: Check both sources and merge results
        let allAddons = [];
        
        // First check Restaurant document
        const restaurant = await Restaurant.findById(restaurantId);
        if (restaurant) {
          // Get addons embedded in restaurant document
          if (restaurant.addons && restaurant.addons.length > 0) {
            console.log(`Found ${restaurant.addons.length} addons in restaurant document`);
            
            const embeddedAddons = restaurant.addons.map(addon => ({
              ...addon,
              _id: addon._id.toString(),
              // Ensure required fields have values
              quantityMinimum: addon.quantityMinimum ?? 0,
              quantityMaximum: addon.quantityMaximum ?? 1
            }));
            
            allAddons = [...embeddedAddons];
          }
        }
        
        // Also check the Addon collection
        const addonDocs = await Addon.find({ 
          restaurant: restaurantId,
          isActive: true 
        }).populate('options');
        
        if (addonDocs && addonDocs.length > 0) {
          console.log(`Found ${addonDocs.length} addons in Addon collection`);
          
          const standaloneAddons = addonDocs.map(addon => ({
            ...transformAddon(addon),
            // Ensure required fields have values
            quantityMinimum: addon.quantityMinimum ?? 0,
            quantityMaximum: addon.quantityMaximum ?? 1
          }));
          
          // Merge without duplicates (using _id)
          const existingIds = new Set(allAddons.map(a => a._id));
          const newAddons = standaloneAddons.filter(a => !existingIds.has(a._id));
          allAddons = [...allAddons, ...newAddons];
        }
        
        console.log(`Total addons found for restaurant ${restaurantId}: ${allAddons.length}`);
        return allAddons;
      } catch (error) {
        console.error(`Error fetching addons for restaurant ${restaurantId}:`, error);
        // Log error but return empty array to prevent UI crashes
        return [];
      }
    }
  },
  Mutation: {
    createAddons: async (_, args) => {
      try {
        console.log("createAddons mutation with args:", JSON.stringify(args));

        if (!args.addonInput) {
          throw new Error("Addon input is required");
        }

        const { restaurant: restaurantId, addons } = args.addonInput;

        if (!restaurantId || !addons || addons.length === 0) {
          throw new Error("Missing required fields: restaurant or addons");
        }

        // find the restaurant by ID
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restaurantId} not found`);
        }

        // find the options by IDs
        const optionIds = addons.flatMap(addon => addon.options);
        const options = await Option.find({ '_id': { $in: optionIds } });
        
        // create addons
        const newAddons = [];
        for (const addon of addons) {
          const newAddon = new Addon({
            title: addon.title,
            description: addon.description || "",
            quantityMinimum: addon.quantityMinimum,
            quantityMaximum: addon.quantityMaximum,
            restaurant: restaurantId,
            options: options.filter(option => addon.options.includes(option._id.toString())).map(option => option._id)
          });

          await newAddon.save();
          newAddons.push(newAddon);
        }

        // add IDs of addons
        restaurant.addons = [...restaurant.addons, ...newAddons.map(addon => addon._id)];
        await restaurant.save();

        return {
          _id: restaurant._id,
          addons: newAddons.map(addon => ({
            _id: addon._id,
            title: addon.title,
            description: addon.description,
            quantityMinimum: addon.quantityMinimum,
            quantityMaximum: addon.quantityMaximum,
            isActive: addon.isActive,
            options: addon.options,
          }))
        };
      } catch (error) {
        console.error('Error creating addons:', error);
        throw error;
      }
    },
    editAddon: async (_, { addonInput }) => {
      try{
        console.log("editAddon mutation with args:", JSON.stringify(addonInput));

        if (!addonInput || !addonInput.restaurant || !addonInput.addons) {
          throw new Error("Missing required fields: restaurant or addons");
        }

        const { restaurant: restaurantId, addons } = addonInput;
        
        // find restaurant
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restaurantId} not found`);
        }

        // find list of addons from restaurant
        const addonIndex = restaurant.addons.findIndex(
          addon => addon.toString() === addons._id
        );
        
        if (addonIndex === -1) {
          throw new Error(`Addon with ID ${addons._id} not found in restaurant`);
        }

        console.log(`Found addon at index ${addonIndex}, updating...`);

        // edit Addon
        const existingAddon = await Addon.findById(addons._id);
        if (!existingAddon) {
          throw new Error(`Addon with ID ${addons._id} not found`);
        }

        existingAddon.title = addons.title || existingAddon.title;
        existingAddon.description = addons.description || existingAddon.description;
        existingAddon.quantityMinimum = addons.quantityMinimum || existingAddon.quantityMinimum;
        existingAddon.quantityMaximum = addons.quantityMaximum || existingAddon.quantityMaximum;
        existingAddon.isActive = addons.isActive !== undefined ? addons.isActive : existingAddon.isActive;

        // Formater les options comme des ObjectIds si ce sont des chaînes
        existingAddon.options = Array.isArray(addons.options)
          ? addons.options.map(opt => (typeof opt === 'string' ? opt : opt.toString()))
          : [];

        await existingAddon.save();
        console.log(`Updated standalone addon document ${existingAddon._id}`);

        // edit addon in restaurant by ID
        restaurant.addons[addonIndex] = existingAddon._id;

        await restaurant.save();
        console.log(`Successfully updated addon ${addons._id} in restaurant`);

        return {
          _id: restaurant._id.toString(),
          addons: restaurant.addons.map(addonId => ({
            _id: addonId.toString(),
            title: existingAddon.title,
            description: existingAddon.description || "",
            options: existingAddon.options,
            quantityMinimum: existingAddon.quantityMinimum,
            quantityMaximum: existingAddon.quantityMaximum,
            isActive: existingAddon.isActive
          }))
        };
      } catch (error) {
        console.error('Error editing addon:', error);
        throw new Error(`Failed to edit addon: ${error.message}`);
      }
    },
    deleteAddon: async (_, { id, restaurant }) => {
      try {
        // find restaurant 
        const targetRestaurant = await Restaurant.findById(restaurant).populate({
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
        
        if (!targetRestaurant) {
          throw new Error(`Restaurant with ID ${restaurant} not found`);
        }
    
        // delete addon form restaurant
        const addonIndex = targetRestaurant.addons.findIndex(
          addon => addon._id.toString() === id
        );
        
        if (addonIndex === -1) {
          throw new Error(`Addon with ID ${id} not found in restaurant`);
        }
    
        targetRestaurant.addons.splice(addonIndex, 1);
        
        // delete ref addon from categories, foods, variations
        targetRestaurant.categories.forEach(category => {
          if (category.foods) {
            category.foods.forEach(food => {
              if (food.variations) {
                food.variations.forEach(variation => {
                  if (variation.addons) {
                    // get addons not equal to id
                    variation.addons = variation.addons.filter(addonId => addonId.toString() !== id);
                  }
                });
              }
            });
          }
        });
    
        // delete addon
        await Addon.findByIdAndDelete(id);
        console.log(`Standalone addon document deleted (if it existed)`);
    
        await targetRestaurant.save();
        console.log(`Successfully deleted addon ${id} from restaurant ${restaurant}`);
    
        return {
          _id: targetRestaurant._id.toString(),
          addons: targetRestaurant.addons.map(addon => ({
            _id: addon._id.toString(),
            title: addon.title || "Unnamed Addon",
            description: addon.description || "",
            options: Array.isArray(addon.options)
              ? addon.options.map(opt => typeof opt === 'object' ? opt.toString() : opt)
              : [],
            quantityMinimum: addon.quantityMinimum !== undefined ? addon.quantityMinimum : 0,
            quantityMaximum: addon.quantityMaximum !== undefined ? addon.quantityMaximum : 1,
            isActive: addon.isActive !== undefined ? addon.isActive : true
          }))
        };
    
      } catch (error) {
        console.error('Error deleting addon:', error);
        throw new Error(`Failed to delete addon: ${error.message}`);
      }
    },
  },
};
