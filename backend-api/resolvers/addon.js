const Addon = require('../models/addon');
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
    createAddons: async (_, { addonInput }) => {
      console.log('Creating addons with input:', JSON.stringify(addonInput));
      try {
        const restaurant = await Restaurant.findById(addonInput.restaurant);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${addonInput.restaurant} not found`);
        }
        
        const { addons } = addonInput;
        const createdAddons = [];

        // Create new addons with properly formatted _id fields
        for (const addon of addons) {
          // Create a new MongoDB ObjectId
          const addonId = new mongoose.Types.ObjectId();
          
          console.log(`Creating addon: ${addon.title} with _id: ${addonId}`);
          
          // Create the addon document with required quantity fields
          const newAddon = {
            ...addon,
            _id: addonId,
            restaurant: addonInput.restaurant,
            // Ensure quantity fields are set with defaults if not provided
            quantityMinimum: addon.quantityMinimum !== undefined ? addon.quantityMinimum : 0,
            quantityMaximum: addon.quantityMaximum !== undefined ? addon.quantityMaximum : 1,
            isActive: true
          };
          
          // Convert options array to strings if they are ObjectIds
          if (addon.options && Array.isArray(addon.options)) {
            newAddon.options = addon.options.map(opt => 
              typeof opt === 'object' && opt._id ? opt._id.toString() : opt.toString()
            );
          }
          
          // Store the addon in the Addon collection for standalone access
          const addonDoc = new Addon({
            ...newAddon,
            _id: addonId
          });
          await addonDoc.save();
          
          // Add to restaurant's addons array - include the full document, not just an ID reference
          restaurant.addons.push({
            ...newAddon,
            _id: addonId
          });
          
          // Add to our result array
          createdAddons.push({
            ...newAddon,
            _id: addonId.toString() // Ensure _id is a string for response
          });
        }

        // Save the restaurant with new addons
        const updatedRestaurant = await restaurant.save();
        console.log(`Restaurant saved with ${restaurant.addons.length} addons`);
        
        // Return a properly formatted response
        return {
          _id: updatedRestaurant._id.toString(),
          addons: createdAddons.map(addon => ({
            ...addon,
            _id: addon._id.toString(),
            options: Array.isArray(addon.options) 
              ? addon.options.map(opt => opt.toString()) 
              : [],
            quantityMinimum: addon.quantityMinimum !== undefined ? addon.quantityMinimum : 0,
            quantityMaximum: addon.quantityMaximum !== undefined ? addon.quantityMaximum : 1
          }))
        };
      } catch (error) {
        console.error('Error creating addons:', error);
        throw error;
      }
    },
    editAddon: async (_, { addonInput }) => {
      console.log('Editing addon:', JSON.stringify(addonInput));
      try {
        const restaurant = await Restaurant.findById(addonInput.restaurant);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${addonInput.restaurant} not found`);
        }
        
        const { addons } = addonInput;
        
        // Find the addon in the restaurant's addons array
        const addonIndex = restaurant.addons.findIndex(
          addon => addon._id.toString() === addons._id
        );
        
        if (addonIndex === -1) {
          throw new Error(`Addon with ID ${addons._id} not found in restaurant`);
        }
        
        console.log(`Found addon at index ${addonIndex}, updating...`);
        
        // Format options as ObjectIds if they're string IDs
        const formattedOptions = Array.isArray(addons.options) 
          ? addons.options.map(opt => 
              typeof opt === 'string' ? opt : opt.toString()
            )
          : [];
        
        // Update the addon with new values, preserving the _id
        restaurant.addons[addonIndex] = {
          _id: restaurant.addons[addonIndex]._id,
          title: addons.title || "Unnamed Addon",
          description: addons.description || "",
          options: formattedOptions,
          quantityMinimum: addons.quantityMinimum !== undefined ? addons.quantityMinimum : 0,
          quantityMaximum: addons.quantityMaximum !== undefined ? addons.quantityMaximum : 1,
          isActive: true
        };
        
        // Also update the standalone Addon document if it exists
        const existingAddon = await Addon.findById(addons._id);
        if (existingAddon) {
          console.log(`Also updating standalone addon document`);
          existingAddon.title = addons.title || "Unnamed Addon";
          existingAddon.description = addons.description || "";
          existingAddon.options = formattedOptions;
          existingAddon.quantityMinimum = addons.quantityMinimum !== undefined ? addons.quantityMinimum : 0;
          existingAddon.quantityMaximum = addons.quantityMaximum !== undefined ? addons.quantityMaximum : 1;
          await existingAddon.save();
        }
        
        await restaurant.save();
        console.log(`Successfully updated addon ${addons._id}`);
        
        // Return the updated restaurant with properly formatted addons
        return {
          _id: restaurant._id.toString(),
          addons: restaurant.addons.map(addon => ({
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
        console.error('Error editing addon:', error);
        throw new Error(`Failed to edit addon: ${error.message}`);
      }
    },
    deleteAddon: async (_, { id, restaurant }) => {
      console.log(`Deleting addon with ID ${id} from restaurant ${restaurant}`);
      try {
        // Find the target restaurant
        const targetRestaurant = await Restaurant.findById(restaurant);
        if (!targetRestaurant) {
          throw new Error(`Restaurant with ID ${restaurant} not found`);
        }
        
        // Find the addon in the restaurant's addons array
        const addonIndex = targetRestaurant.addons.findIndex(
          addon => addon._id.toString() === id
        );
        
        if (addonIndex === -1) {
          throw new Error(`Addon with ID ${id} not found in restaurant`);
        }
        
        // Remove the addon from the restaurant's addons array
        targetRestaurant.addons.splice(addonIndex, 1);
        
        // Also remove any references to the addon from variations
        targetRestaurant.categories.forEach(category => {
          if (!category.foods) return;
          
          category.foods.forEach(food => {
            if (!food.variations) return;
            
            food.variations.forEach(variation => {
              if (!variation.addons) return;
              
              // Filter out the addon ID from variation.addons
              variation.addons = variation.addons.filter(addonId => {
                const addonIdStr = addonId.toString ? addonId.toString() : addonId;
                return addonIdStr !== id;
              });
            });
          });
        });

        // Also delete the standalone Addon document if it exists
        await Addon.findByIdAndDelete(id);
        console.log(`Standalone addon document deleted (if it existed)`);
        
        // Save the updated restaurant
        await targetRestaurant.save();
        console.log(`Successfully deleted addon ${id} from restaurant ${restaurant}`);
        
        // Return the updated restaurant with formatted addons
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
