const Restaurant = require("../../models/restaurant");
const mongoose = require("mongoose");

const resolvers = {
  // ...existing resolvers...

  createSubCategories: async (args, req) => {
    try {
      // Check if user is authenticated
      if (!req.isAuth) {
        throw new Error("Not authenticated!");
      }

      const { categoryId, restaurant: restaurantId, subCategories } = args;

      // Find the restaurant and category
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }

      // Find the category in the restaurant
      const categoryIndex = restaurant.categories.findIndex(
        (category) => category._id.toString() === categoryId
      );

      if (categoryIndex === -1) {
        throw new Error("Category not found in restaurant");
      }

      // Format subCategories with new IDs if they don't have one
      const formattedSubCategories = subCategories.map((subCategory) => {
        if (!subCategory._id) {
          return {
            ...subCategory,
            _id: new mongoose.Types.ObjectId(),
            isActive:
              subCategory.isActive !== undefined ? subCategory.isActive : true,
          };
        }
        return subCategory;
      });

      // Update the category with new subCategories
      if (!restaurant.categories[categoryIndex].subCategories) {
        restaurant.categories[categoryIndex].subCategories = [];
      }

      // For each subcategory, either add it or update existing one
      formattedSubCategories.forEach((newSubCategory) => {
        const existingIndex =
          restaurant.categories[categoryIndex].subCategories.findIndex(
            (sc) => sc._id.toString() === newSubCategory._id.toString()
          );

        if (existingIndex > -1) {
          // Update existing subcategory
          restaurant.categories[categoryIndex].subCategories[existingIndex] = {
            ...restaurant.categories[categoryIndex].subCategories[
              existingIndex
            ],
            ...newSubCategory,
          };
        } else {
          // Add new subcategory
          restaurant.categories[categoryIndex].subCategories.push(
            newSubCategory
          );
        }
      });

      // Save the restaurant with updated categories
      await restaurant.save();

      // Return the updated restaurant
      return restaurant;
    } catch (error) {
      console.error("Error creating subcategories:", error);
      throw error;
    }
  },

  // ...existing resolvers...
};

module.exports = resolvers;