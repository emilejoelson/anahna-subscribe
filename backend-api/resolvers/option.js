const Option = require('../models/option');
const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');

module.exports = {
  Query: {
    // options: async (_, args) => {
    //   try {
    //     console.log("Options query with args:", JSON.stringify(args));
        
    //     // Extract restaurant ID
    //     let restaurantId = null;
        
    //     if (args && typeof args === 'object') {
    //       if (typeof args.restaurant === 'string') {
    //         restaurantId = args.restaurant;
    //       } else if (args.restaurant && typeof args.restaurant === 'object' && args.restaurant.id) {
    //         restaurantId = args.restaurant.id;
    //       } else if (args.id) {
    //         restaurantId = args.id;
    //       }
    //     }
        
    //     console.log("Using restaurant ID for query:", restaurantId);
        
    //     if (!restaurantId) {
    //       throw new Error("Restaurant ID is required to fetch options");
    //     }
        
    //     // Get options from restaurant document
    //     const restaurant = await Restaurant.findById(restaurantId);
    //     if (!restaurant) {
    //       throw new Error(`Restaurant with ID ${restaurantId} not found`);
    //     }
        
    //     const options = restaurant.options || [];
    //     console.log(`Found ${options.length} options in restaurant`);
        
    //     // Format options to match expected structure
    //     return options.map(option => ({
    //       _id: option._id,
    //       title: option.title,
    //       description: option.description || "",
    //       price: option.price,
    //       restaurant: restaurantId,
    //       isActive: option.isActive !== undefined ? option.isActive : true,
    //       options: [{
    //         _id: option._id,
    //         title: option.title,
    //         description: option.description || "",
    //         price: option.price
    //       }]
    //     }));
    //   } catch (error) {
    //     console.error('Error fetching options:', error);
    //     throw new Error('Failed to fetch options: ' + error.message);
    //   }
    // }
  },
  Mutation: {
    createOptions: async (_, args) => {
      const { restaurant: restaurantId, options: optionInputs } = args.optionInput;
    
      // is restaurantId exist ?
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        throw new Error(`Restaurant with ID ${restaurantId} not found`);
      }
    
      // insertMany => create options
      const createdOptions = await Option.insertMany(
        optionInputs.map(optionInput => ({
          title: optionInput.title,
          price: optionInput.price,
          description: optionInput.description || '',
          restaurant: restaurantId
        }))
      );
    
      // add options to restaurant
      restaurant.options.push(...createdOptions.map(opt => opt._id));
      await restaurant.save();
    
      return {
        _id: restaurantId,
        options: createdOptions.map(option => ({
          _id: option._id,
          title: option.title,
          description: option.description,
          price: option.price,
        })),
      };
    },
    deleteOption: async (_, args) => {
      try {
        const { id, restaurant } = args;

        console.log(`Deleting option ${id} from restaurant ${restaurant}`);

        // delete Option
        const option = await Option.findByIdAndDelete(id);
        if (!option) {
          throw new Error(`Option with ID ${id} not found`);
        }

        // remove from restaurant
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          restaurant,
          { $pull: { options: new mongoose.Types.ObjectId(id) } },
          { new: true } 
        ).populate('options');

        if (!updatedRestaurant) {
          throw new Error(`Restaurant with ID ${restaurant} not found`);
        }

        return {
          _id: updatedRestaurant._id,
          options: updatedRestaurant.options.map((option) => ({
            _id: option._id,
            title: option.title,
            description: option.description || '',
            price: option.price,
          })),
        };
      } catch (error) {
        console.error('Error deleting option:', error);
        throw new Error('Failed to delete option: ' + error.message);
      }
    },
    editOption: async (_, args) => {
      try{
        console.log("editOption mutation with args:", JSON.stringify(args));

        if (!args.optionInput) {
          throw new Error("Option input is required");
        }

        const restaurantId = args.optionInput.restaurant;
        const optionInput = args.optionInput.options;

        if (!restaurantId || !optionInput || !optionInput._id) {
          throw new Error("Missing required fields: restaurant, options, or option._id");
        }

        console.log(`Updating option for restaurant ${restaurantId}`);

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          throw new Error(`Restaurant with ID ${restaurantId} not found`);
        }

        // find the option by ID
        const option = await Option.findById(optionInput._id);
        if (!option) {
          throw new Error(`Option with ID ${optionInput._id} not found`);
        }

        // edit the option
        option.title = optionInput.title;
        option.description = optionInput.description || '';
        option.price = optionInput.price;

        await option.save();
        console.log("Updated existing option:", option);

        // edit the restaurant options
        const updatedRestaurant = await Restaurant.findById(restaurantId).populate('options');

        return {
          _id: updatedRestaurant._id,
          options: updatedRestaurant.options.map((opt) => ({
            _id: opt._id,
            title: opt.title,
            description: opt.description || '',
            price: opt.price,
          })),
        };
      } catch (error) {
        console.error("Error in editOption:", error);
        throw new Error(`Failed to edit option: ${error.message}`);
      }
    }
  }
};
