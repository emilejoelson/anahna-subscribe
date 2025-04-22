const Restaurant = require("../../models/restaurant");
const mongoose = require("mongoose");
const Review = require("../../models/review");
const Category = require("../../models/category");
const Option = require("../../models/option");
const Addon = require("../../models/addon");
const Zone = require("../../models/zone");

const resolvers = {
  Query: {
    restaurant: async (_, { id, slug }) => {
      try {
        let restaurant;
        if (id) {
          restaurant = await Restaurant.findById(id);
        } else if (slug) {
          restaurant = await Restaurant.findOne({ slug });
        }
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        // Get review data
        const reviews = await Review.find({ restaurant: restaurant._id }).populate({
          path: "order",
          populate: {
            path: "user",
            select: "_id name email",
          },
        });

        const reviewData = {
          total: reviews.length,
          ratings:
            reviews.length > 0
              ? reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
              : 0,
          reviews: reviews,
          __typename: "ReviewData",
        };

        // Get categories with foods
        const categories = await Category.find({ restaurant: restaurant._id }).populate({
          path: "foods",
          populate: {
            path: "variations",
          },
        });

        // Get options and addons
        const options = await Option.find({ restaurant: restaurant._id });
        const addons = await Addon.find({ restaurant: restaurant._id });

        // Get zone information
        const zone = await Zone.findOne({
          "location.coordinates": {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: restaurant.location.coordinates.map(Number),
              },
            },
          },
        });

        return {
          ...restaurant._doc,
          reviewData,
          categories,
          options,
          addons,
          zone,
          __typename: "Restaurant",
        };
      } catch (error) {
        throw error;
      }
    },
  },

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
};

module.exports = resolvers;