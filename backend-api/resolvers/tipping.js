const Tipping = require('../models/tipping');

module.exports = {
  Query: {
    tips: async () => {
      try {
        let tippingConfig = await Tipping.findOne();
        return tippingConfig;
      } catch (error) {
        console.error('Error fetching tipping configuration:', error);
        throw new Error('Could not fetch tipping configuration');
      }
    },
  },
  Mutation: {
    createTipping: async (_, { tippingInput }) => {
      try {
        const newTipping = new Tipping(tippingInput);
        return await newTipping.save();
      } catch (error) {
        console.error('Error creating tipping configuration:', error);
        throw new Error('Could not create tipping configuration');
      }
    },
    editTipping: async (_, { tippingInput }) => {
      console.log('Editing tipping with input:', tippingInput);
      try {
        const updatedTipping = await Tipping.findByIdAndUpdate(
          tippingInput._id,
          {
            tipVariations: tippingInput.tipVariations,
            enabled: tippingInput.enabled,
          },
          { new: true }
        );
        
        if (!updatedTipping) {
          throw new Error('Tipping configuration not found');
        }
        
        return updatedTipping;
      } catch (error) {
        console.error('Error editing tipping configuration:', error);
        throw new Error('Could not edit tipping configuration');
      }
    },
    deleteTipping: async (_, { _id }) => {
      try {
        const deletedTipping = await Tipping.findByIdAndDelete(_id);
        if (!deletedTipping) {
          throw new Error(`Could not find tipping configuration with ID: ${_id}`);
        }
        return true; // Indicate successful deletion
      } catch (error) {
        console.error('Error deleting tipping configuration:', error);
        throw new Error('Could not delete tipping configuration');
      }
    },
  },
};