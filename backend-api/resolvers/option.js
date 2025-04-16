const Option = require('../models/option');
const Restaurant = require('../models/restaurant');

module.exports = {
  Query: {
    options: async (_, args) => {
      const options = await Option.find({ restaurant: args.restaurant });
      return options;
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
    updateOption: async (_, args) => {
      const option = await Option.findByIdAndUpdate(
        args.id,
        {
          title: args.title,
          price: args.price,
          isActive: args.isActive
        },
        { new: true }
      );
      return option;
    },
    deleteOption: async (_, args) => {
      await Option.findByIdAndDelete(args.id);
      return true;
    }
  }
};
