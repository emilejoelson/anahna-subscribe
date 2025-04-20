const Option = require('../models/option');
const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');

module.exports = {
  Query: {
    options: async (_, args) => {
      try {
        console.log("Options query with args:", JSON.stringify(args));
        
        // Extract restaurant ID
        let restaurantId = null;
        
        if (args && typeof args === 'object') {
          if (typeof args.restaurant === 'string') {
            restaurantId = args.restaurant;
          } else if (args.restaurant && typeof args.restaurant === 'object' && args.restaurant.id) {
            restaurantId = args.restaurant.id;
          } else if (args.id) {
            restaurantId = args.id;
          }
        }
        
        console.log("Using restaurant ID for query:", restaurantId);
        
        if (!restaurantId) {
          throw new Error("Restaurant ID is required to fetch options");
        }
        
        // Get options from restaurant document
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restaurantId} not found`);
        }
        
        const options = restaurant.options || [];
        console.log(`Found ${options.length} options in restaurant`);
        
        // Format options to match expected structure
        return options.map(option => ({
          _id: option._id,
          title: option.title,
          description: option.description || "",
          price: option.price,
          restaurant: restaurantId,
          isActive: option.isActive !== undefined ? option.isActive : true,
          options: [{
            _id: option._id,
            title: option.title,
            description: option.description || "",
            price: option.price
          }]
        }));
      } catch (error) {
        console.error('Error fetching options:', error);
        throw new Error('Failed to fetch options: ' + error.message);
      }
    }
  },
  Mutation: {
    createOption: async (_, args) => {
      const option = new Option({
        title: args.title,
        price: args.price,
        restaurant: args.restaurant,
        addon: args.addon
      });
      await option.save();
      return option;
    },
    createOptions: async (_, args) => {
      console.log("Creating options with args:", args);
      
      const options = args.optionInput.options.map(optionInput => ({
        title: optionInput.title,
        price: optionInput.price,
        description: optionInput.description,
        isActive: true
      }));
      
      // Instead of creating separate Option documents, add options to the restaurant
      const restaurantId = args.optionInput.restaurant;
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (!restaurant) {
        throw new Error(`Restaurant with ID ${restaurantId} not found`);
      }
      
      // Initialize options array if it doesn't exist
      if (!restaurant.options) {
        restaurant.options = [];
      }
      
      // Add new options to the restaurant
      restaurant.options.push(...options);
      
      // Save the updated restaurant
      await restaurant.save();
      console.log("Added options to restaurant:", restaurant.options);
      
      // Format response to match client expectations
      return {
        _id: restaurantId,
        options: restaurant.options.map(option => ({
          _id: option._id,
          title: option.title,
          description: option.description,
          price: option.price
        }))
      };
    },
    updateOption: async (_, args) => {
      try {
        console.log("Updating option with args:", JSON.stringify(args));
        
        // Extract the option ID and restaurant ID
        let optionId = args.id;
        
        // Find the restaurant containing this option
        const restaurant = await Restaurant.findOne({ "options._id": optionId });
        if (!restaurant) {
          throw new Error(`Restaurant containing option ${optionId} not found`);
        }
        
        // Find the option in the restaurant's options array
        const optionIndex = restaurant.options.findIndex(
          option => option._id.toString() === optionId
        );
        
        if (optionIndex === -1) {
          throw new Error(`Option with ID ${optionId} not found in restaurant`);
        }
        
        // Update the option in the array
        if (args.title !== undefined) {
          restaurant.options[optionIndex].title = args.title;
        }
        if (args.price !== undefined) {
          restaurant.options[optionIndex].price = args.price;
        }
        if (args.description !== undefined) {
          restaurant.options[optionIndex].description = args.description;
        }
        if (args.isActive !== undefined) {
          restaurant.options[optionIndex].isActive = args.isActive;
        }
        
        // Save the updated restaurant
        await restaurant.save();
        
        const updatedOption = restaurant.options[optionIndex];
        console.log("Updated option:", updatedOption);
        
        // Return the updated option
        return {
          _id: updatedOption._id,
          title: updatedOption.title,
          description: updatedOption.description || "",
          price: updatedOption.price,
          restaurant: restaurant._id,
          isActive: updatedOption.isActive,
          options: [{
            _id: updatedOption._id,
            title: updatedOption.title,
            description: updatedOption.description || "",
            price: updatedOption.price
          }]
        };
      } catch (error) {
        console.error('Error updating option:', error);
        throw new Error('Failed to update option: ' + error.message);
      }
    },
    deleteOption: async (_, args) => {
      try {
        console.log("Delete option args:", JSON.stringify(args));
        
        let optionId = args.id;
        
        // Find the restaurant containing this option
        const restaurant = await Restaurant.findOne({ "options._id": optionId });
        if (!restaurant) {
          console.log(`Restaurant containing option ${optionId} not found`);
          return false;
        }
        
        // Remove the option from the options array
        restaurant.options = restaurant.options.filter(
          option => option._id.toString() !== optionId
        );
        
        // Save the updated restaurant
        await restaurant.save();
        console.log(`Option with ID ${optionId} deleted successfully`);
        
        return true;
      } catch (error) {
        console.error('Error deleting option:', error);
        throw new Error('Failed to delete option: ' + error.message);
      }
    },
    editOption: async (_, args) => {
      try {
        console.log("editOption mutation with args:", JSON.stringify(args));
        
        if (!args.optionInput) {
          throw new Error("Option input is required");
        }
        
        const restaurantId = args.optionInput.restaurant;
        const option = args.optionInput.options;
        
        if (!restaurantId || !option) {
          throw new Error("Missing required fields: restaurant or options");
        }
        
        console.log(`Updating option for restaurant ${restaurantId}`);
        
        // Find the option by ID if provided, otherwise create a new one
        let existingOption;
        if (option._id) {
          const restaurant = await Restaurant.findOne({ "options._id": option._id });
          if (!restaurant) {
            throw new Error(`Restaurant containing option ${option._id} not found`);
          }
          
          const optionIndex = restaurant.options.findIndex(
            opt => opt._id.toString() === option._id
          );
          
          if (optionIndex === -1) {
            throw new Error(`Option with ID ${option._id} not found in restaurant`);
          }
          
          restaurant.options[optionIndex] = {
            ...restaurant.options[optionIndex],
            title: option.title,
            description: option.description,
            price: option.price
          };
          
          await restaurant.save();
          existingOption = restaurant.options[optionIndex];
          console.log("Updated existing option:", existingOption);
        } else {
          const restaurant = await Restaurant.findById(restaurantId);
          if (!restaurant) {
            throw new Error(`Restaurant with ID ${restaurantId} not found`);
          }
          
          const newOption = {
            title: option.title,
            description: option.description,
            price: option.price
          };
          
          if (!restaurant.options) {
            restaurant.options = [];
          }
          
          restaurant.options.push(newOption);
          await restaurant.save();
          existingOption = newOption;
          console.log("Created new option:", existingOption);
        }
        
        // Find the restaurant to return it
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restaurantId} not found`);
        }
        
        return restaurant;
      } catch (error) {
        console.error("Error in editOption:", error);
        throw new Error(`Failed to edit option: ${error.message}`);
      }
    }
  }
};
