const jwt = require("jsonwebtoken");
var randomstring = require("randomstring");
const mongoose = require("mongoose");
const Restaurant = require("../models/restaurant");
const Owner = require("../models/owner");
const Offer = require("../models/offer");
const Order = require("../models/order");
const Point = require("../models/point");
const Section = require("../models/section");
const Zone = require("../models/zone");
const User = require("../models/user");
const Option = require("../models/option");
const Review = require("../models/review");
const Addon = require("../models/addon");
const Category = require("../models/category");
const Configuration = require("../models/configuration");
const {
  sendNotificationToCustomerWeb,
} = require("../helpers/firebase-web-notifications");
const {
  transformRestaurant,
  transformOwner,
  transformRestaurants,
  transformOrder,
  transformMinimalRestaurantData,
  transformMinimalRestaurants,
  transformRestaurantNew,
} = require("./merge");
const {
  order_status,
  SHOP_TYPE,
  getThirtyDaysAgo,
} = require("../helpers/enum");
const {
  publishToZoneRiders,
  publishOrder,
  publishToUser,
} = require("../helpers/pubsub");
const { sendNotificationToZoneRiders } = require("../helpers/notifications");
const {
  sendNotificationToUser,
  sendNotificationToRider,
} = require("../helpers/notifications");
const bcrypt = require("bcryptjs");

module.exports = {
  Query: {
    restaurants: async () => {
      try {
        console.log("Fetching restaurants from database");
        const restaurants = await Restaurant.find();

        // Make sure to wait for the transformation to complete
        const transformedRestaurants = await transformRestaurants(restaurants);
        console.log(
          "Transformed restaurants count:",
          transformedRestaurants.length
        );

        // Verify that the first item has an _id to debug
        if (transformedRestaurants.length > 0) {
          console.log("First restaurant _id:", transformedRestaurants[0]._id);
        }

        return transformedRestaurants;
      } catch (err) {
        console.error("Error in restaurants resolver:", err);
        throw err;
      }
    },
    getClonedRestaurants: async () => {
      try {
        console.log("Fetching cloned restaurants from database");
        const restaurants = await Restaurant.find({ isCloned: true });

        // Important: await the transformation process since transformRestaurant is async
        const transformedRestaurants = await Promise.all(
          restaurants.map((restaurant) => transformRestaurant(restaurant))
        );

        // Log some details for debugging
        console.log(
          `Transformed ${transformedRestaurants.length} cloned restaurants`
        );
        if (transformedRestaurants.length > 0) {
          console.log(
            `First cloned restaurant _id: ${transformedRestaurants[0]._id}`
          );
        }

        return transformedRestaurants;
      } catch (error) {
        console.error("Error in getClonedRestaurants resolver:", error);
        throw new Error(`Could not fetch cloned restaurants: ${error.message}`);
      }
    },

    restaurant: async (_, args, { req }) => {
      console.log("restaurant query called with args:", args);
      try {
        const filters = {};
        if (args.slug) {
          filters.slug = args.slug;
        } else if (args.id) {
          filters._id = args.id;
        } else if (req.restaurantId) {
          filters._id = req.restaurantId;
        } else {
          throw new Error("Invalid request, restaurant id not provided");
        }

        console.log("Finding restaurant with filters:", filters);
        const restaurant = await Restaurant.findOne(filters)
          .select("-password")
          .populate("owner")
          .lean();

        if (!restaurant) {
          console.log(`Restaurant not found with filters:`, filters);
          throw Error("Restaurant not found");
        }

        const reviews = await Review.find({ restaurant: restaurant._id })
          .sort({ createdAt: -1 })
          .populate({
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

        const transformedRestaurant = {
          ...restaurant,
          orderId:
            typeof restaurant.orderId === "number" ? restaurant.orderId : 0,
          reviewData,
          owner: restaurant.owner
            ? {
                _id: restaurant.owner._id,
                email: restaurant.owner.email || "",
              }
            : null,
          __typename: "Restaurant",
        };

        console.log("Found restaurant:", restaurant.name);
        return transformedRestaurant;
      } catch (e) {
        console.error("Error in restaurant query:", e);
        throw e;
      }
    },

    restaurantByOwner: async (_, args, { req }) => {
      console.log("restaurantByOwner");
      try {
        const id = args.id || req.userId;

        console.log(`Fetching owner ${id} from database`);
        const owner = await Owner.findById(id);
        const transformedOwner = transformOwner(owner);

        return transformedOwner;
      } catch (e) {
        console.error("Error in restaurantByOwner resolver:", e);
        throw e;
      }
    },

    getRestaurantDeliveryZoneInfo: async (_, args, { req }) => {
      console.log("getRestaurantDeliveryZoneInfo");
      try {
        const id = args.id;

        console.log(`Fetching delivery zone info for restaurant ${id}`);
        const restaurant = await Restaurant.findById(id);

        const zoneInfo = {
          boundType: restaurant.boundType,
          deliveryBounds: restaurant.deliveryBounds,
          location: restaurant.location,
          circleBounds: restaurant.circleBounds,
          address: restaurant.address,
          city: restaurant.city,
          postCode: restaurant.postCode,
        };

        return zoneInfo;
      } catch (e) {
        console.error("Error in getRestaurantDeliveryZoneInfo resolver:", e);
        throw e;
      }
    },

    restaurantsPreview: async (_) => {
      console.log("restaurantsPreview");
      try {
        console.log("Fetching restaurants preview from database");
        const restaurants = await Restaurant.find();
        const transformedRestaurants = transformMinimalRestaurants(restaurants);

        return transformedRestaurants;
      } catch (e) {
        console.error("Error in restaurantsPreview resolver:", e);
        throw e;
      }
    },

    restaurantPreview: async (_, args, { req }) => {
      console.log("restaurantPreview", args);
      try {
        console.log(`Fetching restaurant preview for ${args.id}`);
        const restaurant = await Restaurant.findById(args.id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        const preview = {
          _id: restaurant._id.toString(),
          boundType: restaurant.deliveryBounds
            ? "polygon"
            : restaurant.circleBounds
            ? "circle"
            : null,
          deliveryBounds: restaurant.deliveryBounds,
          circleBounds: restaurant.circleBounds,
          location: restaurant.location,
          address: restaurant.address,
          city: restaurant.city,
          postCode: restaurant.postCode,
        };

        return preview;
      } catch (error) {
        console.error("Error in restaurantPreview:", error);
        throw new Error(`Could not fetch delivery zone info: ${error.message}`);
      }
    },

    nearByRestaurants: async (_, { latitude, longitude, shopType }) => {
      try {
        if (!latitude || !longitude) {
          throw new Error("Latitude and Longitude are required.");
        }

        console.log(
          `Fetching nearby restaurants for location ${latitude},${longitude}`
        );
        //get maxDistanceInMeters from configuration model

        const config = await Configuration.findOne();
        const maxDistanceInMeters = config?.maxDistanceInMeters; // .. km radius

        const query = {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistanceInMeters,
            },
          },
          isActive: true,
          isAvailable: true,
        };

        if (shopType) {
          query.shopType = shopType;
        }

        const restaurants = await Restaurant.find(query)
        .populate("reviewData")
        .populate("addons")
        .populate("options")
        .populate({
          path: "categories",
          model: "Category",
          populate: {
            path: "foods",
            model: "Food",
            populate: {
              path: "variations",
              model: "Variation",
              populate: {
                path: "addons",
                model: "Addon"
              }
            }
          }
        });
          
        const offers = await Offer.find({
          restaurants: { $in: restaurants.map((r) => r._id.toString()) },
        });

        const sections = await Section.find({
          restaurants: { $in: restaurants.map((r) => r._id.toString()) },
        });

        const result = {
          restaurants,
          offers,
          sections,
        };

        return result;
      } catch (error) {
        console.error("Error in nearByRestaurants:", error);
        throw new Error("Could not fetch nearby restaurants.");
      }
    },

    nearByRestaurantsPreview: async (_, { latitude, longitude, shopType }) => {
      try {
        if (!latitude || !longitude) {
          throw new Error("Latitude and Longitude are required.");
        }

        console.log(
          `Fetching nearby restaurants preview for location ${latitude},${longitude}`
        );
        const maxDistanceInMeters = 5000; // 5 km radius

        const query = {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistanceInMeters,
            },
          },
          isActive: true,
          isAvailable: true,
        };

        if (shopType) {
          query.shopType = shopType;
        }

        const restaurants = await Restaurant.find(query)
          .populate("reviewData")
          .populate("addons")
          .populate("options");

        const offers = await Offer.find({
          restaurants: { $in: restaurants.map((r) => r._id.toString()) },
        });

        const sections = await Section.find({
          restaurants: { $in: restaurants.map((r) => r._id.toString()) },
        });

        const result = {
          restaurants,
          offers,
          sections,
        };

        return result;
      } catch (error) {
        console.error("Error in nearByRestaurantsPreview:", error);
        throw new Error("Could not fetch nearby restaurants.");
      }
    },

    subCategories: async (_, { categoryId }) => {
      try {
        console.log(`Fetching subcategories for category ${categoryId}`);
        const restaurant = await Restaurant.findOne({
          "categories._id": categoryId,
        });
        if (!restaurant) {
          return [];
        }

        const category = restaurant.categories.find(
          (cat) => cat._id.toString() === categoryId
        );
        if (!category || !category.subCategories) {
          return [];
        }

        const subCategories = category.subCategories.map((sub) => ({
          _id: sub._id.toString(),
          title: sub.title || "",
          description: sub.description || "",
          isActive: sub.isActive !== undefined ? sub.isActive : true,
          parentCategoryId: categoryId,
        }));

        return subCategories;
      } catch (error) {
        console.error("Error fetching subCategories:", error);
        return [];
      }
    },
  },

  Mutation: {
    createRestaurant: async (_, args, { req }) => {
      console.log("createRestanrant", args);
      try {
        const restaurantExists = await Restaurant.exists({
          name: { $regex: new RegExp("^" + args.restaurant.name + "$", "i") },
        });
        if (restaurantExists) {
          throw Error("Restaurant by this name already exists");
        }
        const owner = await Owner.findById(args.owner);
        console.log("owner", owner);

        if (!owner) throw new Error("Owner does not exist");
        const orderPrefix = randomstring.generate({
          length: 5,
          capitalization: "uppercase",
        });

        const hashedPassword = await bcrypt.hash(args.restaurant.password, 12);

        const restaurant = new Restaurant({
          name: args.restaurant.name,
          address: args.restaurant.address,
          image: args.restaurant.image,
          logo: args.restaurant.logo,
          orderPrefix: orderPrefix,
          isActive: true,
          deliveryTime: args.restaurant.deliveryTime,
          minimumOrder: args.restaurant.minimumOrder,
          slug: args.restaurant.name.toLowerCase().split(" ").join("-"),
          username: args.restaurant.username,
          password: hashedPassword,
          owner: args.owner,
          tax: args.restaurant.salesTax,
          cuisines: args.restaurant.cuisines ?? [],
          shopType: args.restaurant.shopType || SHOP_TYPE.RESTAURANT,
          phone: args.restaurant.phone,
        });
        console.log("New Restaurant: ", restaurant);

        const result = await restaurant.save();
        owner.restaurants.push(result.id);
        await owner.save();

        return {
          ...result._doc,
          _id: result.id,
          owner: {
            _id: owner._id,
            email: owner.email,
            isActive: owner.isActive,
          },
        };
      } catch (err) {
        throw new Error(`Could not create restaurant: ${err.message}`);
      }
    },

    deleteRestaurant: async (_, { id }) => {
      try {
        const restaurant = await Restaurant.findByIdAndUpdate(id, {
          new: true,
        });
        if (restaurant.isActive) {
          restaurant.isActive = false;
        } else {
          restaurant.isActive = true;
        }
        await restaurant.save();
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        return { _id: restaurant.id, isActive: restaurant.isActive };
      } catch (err) {
        throw new Error(`Could not delete restaurant: ${err.message}`);
      }
    },

    hardDeleteRestaurant: async (_, { id }) => {
      try {
        const restaurant = await Restaurant.findByIdAndDelete(id);
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        await Owner.findByIdAndUpdate(restaurant.owner, {
          $pull: { restaurants: id },
        });

        return true;
      } catch (err) {
        throw new Error(`Could not hard delete restaurant: ${err.message}`);
      }
    },

    editRestaurant: async (_, { restaurant: restaurantInput }) => {
      try {
        console.log("editRestaurant", restaurantInput);
        const restaurant = await Restaurant.findByIdAndUpdate(
          restaurantInput._id,
          { ...restaurantInput },
          { new: true }
        );
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        return transformRestaurant(restaurant);
      } catch (err) {
        throw new Error(`Could not edit restaurant: ${err.message}`);
      }
    },

    duplicateRestaurant: async (_, { id, owner }) => {
      try {
        const existingRestaurant = await Restaurant.findById(id);
        if (!existingRestaurant) {
          throw new Error("Restaurant not found");
        }
        const restaurantCount = await Restaurant.countDocuments();
        const newRestaurantData = { ...existingRestaurant._doc };
        delete newRestaurantData._id;
        delete newRestaurantData.unique_restaurant_id;
        delete newRestaurantData.orderId;
        delete newRestaurantData.slug;
        newRestaurantData.name = `${newRestaurantData.name} (Clone)`;
        newRestaurantData.username = `${
          newRestaurantData.username
        }_clone_${Date.now()}`;
        newRestaurantData.orderId = restaurantCount + 1;
        newRestaurantData.unique_restaurant_id = Math.random()
          .toString(36)
          .substring(2, 15);
        newRestaurantData.slug =
          newRestaurantData.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "") +
          "-" +
          Math.random().toString(36).substring(2, 7);
        newRestaurantData.owner = owner;
        const newRestaurant = new Restaurant(newRestaurantData);
        const savedRestaurant = await newRestaurant.save();
        await Owner.findByIdAndUpdate(owner, {
          $push: { restaurants: savedRestaurant._id },
        });

        return transformRestaurant(savedRestaurant);
      } catch (error) {
        throw new Error(`Could not duplicate restaurant: ${error.message}`);
      }
    },

    updateCommission: async (_, { id, commissionRate }) => {
      try {
        console.log("========updateCommission========", id, commissionRate);

        if (!id || !commissionRate) {
          throw new Error("Restaurant ID and commission rate are required");
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { commissionRate },
          { new: true }
        );

        if (!updatedRestaurant) {
          throw new Error("Restaurant not found");
        }

        return {
          _id: updatedRestaurant._id.toString(),
          commissionRate: updatedRestaurant.commissionRate,
        };
      } catch (error) {
        throw new Error(`Could not update commission: ${error.message}`);
      }
    },

    updateDeliveryBoundsAndLocation: async (
      _,
      { id, boundType, bounds, circleBounds, location, address, postCode, city }
    ) => {
      try {
        const updateData = {};
    
        if (address) updateData.address = address;
        if (postCode) updateData.postCode = postCode;
        if (city) updateData.city = city;
    
        // Toujours stocker la localisation si elle est fournie
        if (location && location.latitude && location.longitude) {
          updateData.location = {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          };
        }
    
        // Vérifie la validité du format polygonal
        const isValidPolygonCoordinates = (coords) =>
          Array.isArray(coords) &&
          coords.length > 0 &&
          coords.every((polygon) =>
            Array.isArray(polygon) &&
            polygon.every(
              (point) =>
                Array.isArray(point) &&
                point.length === 2 &&
                point.every((coord) => typeof coord === "number")
            )
          );
    
        if (boundType === "polygon" && isValidPolygonCoordinates(bounds)) {
          updateData.boundType = "polygon";
          updateData.deliveryBounds = {
            type: "Polygon",
            coordinates: bounds,
          };
          updateData.circleBounds = undefined;
        } else if (boundType === "radius" && circleBounds?.radius && isValidPolygonCoordinates(bounds)) {
          updateData.boundType = "radius";
          updateData.deliveryBounds = {
            type: "Polygon",
            coordinates: bounds,
          };
          updateData.circleBounds = {
            radius: circleBounds.radius,
          };
        } else if (boundType === "point") {
          updateData.boundType = "point";
          updateData.deliveryBounds = undefined;
          updateData.circleBounds = undefined;
        }
    
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );
    
        if (!updatedRestaurant) {
          return { success: false, message: "Restaurant not found" };
        }
    
        return {
          success: true,
          message: "Delivery bounds and location updated successfully",
          data: {
            _id: updatedRestaurant._id,
            deliveryBounds: updatedRestaurant.deliveryBounds,
            circleBounds: updatedRestaurant.circleBounds,
            location: updatedRestaurant.location,
            boundType: updatedRestaurant.boundType,
            address: updatedRestaurant.address,
            city: updatedRestaurant.city,
            postCode: updatedRestaurant.postCode,
          },
        };
      } catch (error) {
        console.error("Error updating bounds and location:", error);
        throw new Error("Failed to update delivery bounds and location");
      }
    },  
    orderPickedUp: async (_, args, { req }) => {
      console.log("orderPickedUp");
      if (!req.restaurantId) {
        throw new Error("Unauthenticated!");
      }
      try {
        const order = await Order.findById(args._id);
        const status = order.isPickedUp ? order_status[3] : order_status[2];
        order.orderStatus = status;
        const restaurant = await Restaurant.findById(req.restaurantId);
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        );

        order[order.isPickedUp ? "deliveredAt" : "pickedAt"] = new Date();

        const result = await order.save();
        const user = await User.findById(result.user);
        const transformedOrder = await transformOrder(result);

        if (!transformedOrder.isPickedUp) {
          publishToUser(result.rider.toString(), transformedOrder, "update");
        }
        publishToUser(result.user.toString(), transformedOrder, "update");
        publishOrder(transformedOrder);
        sendNotificationToUser(result.user.toString(), transformedOrder);
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        );
        return transformedOrder;
      } catch (err) {
        throw err;
      }
    },

    updateTimings: async (_, { id, openingTimes }, { models }) => {
      try {
        if (!openingTimes || openingTimes.length === 0) {
          throw new Error("openingTimes required");
        }

        const cleanedOpeningTimes = openingTimes.map((timing) => ({
          day: timing.day,
          times: timing.times.map((time) => ({
            startTime: Array.isArray(time.startTime) ? time.startTime : [],
            endTime: Array.isArray(time.endTime) ? time.endTime : [],
          })),
        }));

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { $set: { openingTimes: cleanedOpeningTimes } },
          { new: true }
        );

        if (!updatedRestaurant) {
          throw new Error("Restaurant not found");
        }

        return {
          _id: updatedRestaurant._id.toString(),
          openingTimes: updatedRestaurant.openingTimes,
        };
      } catch (error) {
        console.error("Error in updateTimings:", error);
        throw new Error(`Update Timing Error: ${error.message}`);
      }
    },
  },

  Restaurant: {
    options: async (parent) => {
      if (!parent.options || parent.options.length === 0) {
        console.log(
          `No options found for restaurant ${parent._id}`,
          parent.options
        );
        return [];
      }

      const options = await Option.find({ _id: { $in: parent.options } });
      console.log(
        `Found ${parent.options.length} options for restaurant ${parent._id}`
      );

      return options.map((option) => ({
        _id: option._id,
        title: option.title,
        description: option.description || "",
        price: option.price,
        restaurant: parent._id,
        isActive: option.isActive,
      }));
    },
    addons: async (parent) => {
      console.log(`Getting addons for restaurant ${parent._id}`);
      try {
        if (!parent.addons || parent.addons.length === 0) {
          console.log(`No addons found for restaurant ${parent._id}`);
          return [];
        }

        const addons = await Addon.find({ _id: { $in: parent.addons } });

        const formattedAddons = addons.map((addon) => ({
          _id: addon._id,
          title: addon.title,
          description: addon.description || "",
          quantityMinimum: addon.quantityMinimum,
          quantityMaximum: addon.quantityMaximum,
          options: addon.options,
          restaurant: parent._id,
          isActive: addon.isActive,
        }));

        console.log("Formatted Addons:", formattedAddons);

        return formattedAddons;
      } catch (error) {
        console.error(
          `Error fetching addons for restaurant ${parent._id}:`,
          error
        );
        return [];
      }
    },
    categories: async (parent) => {
      console.log(`Getting categories for restaurant ${parent._id}`);
      try {
        if (!parent.categories || parent.categories.length === 0) {
          console.log(`No categories found for restaurant ${parent._id}`);
          return [];
        }

        // find categories
        const categories = await Category.find({
          _id: { $in: parent.categories },
        })
          .populate({
            path: "foods",
            populate: {
              path: "variations",
              model: "Variation",
              populate: {
                path: "addons",
                model: "Addon",
              },
            },
          })
          .populate({
            path: "subCategories",
            model: "SubCategory",
          });

        // Map the categories to the desired structure
        const formattedCategories = categories.map((category) => ({
          _id: category._id.toString(),
          title: category.title,
          image: category.image || "",
          description: category.description || "",
          restaurant: parent._id,
          isActive: category.isActive,
          foods: category.foods.map((food) => ({
            _id: food._id.toString(),
            title: food.title,
            description: food.description || "",
            image: food.image || "",
            price: food.price,
            variations: food.variations.map((variation) => ({
              _id: variation._id.toString(),
              title: variation.title,
              price: variation.price,
              discounted: variation.discounted || 0,
              addons:
                variation.addons?.map((addon) => addon._id.toString()) || [],
              isOutOfStock: variation.isOutOfStock || false,
              isActive: variation.isActive || true,
            })),
            isOutOfStock: food.isOutOfStock || false,
            isAvailable: food.isAvailable || true,
            isActive: food.isActive || true,
          })),
          subCategories: category.subCategories.map((subCategory) => ({
            _id: subCategory._id.toString(),
            title: subCategory.title,
            description: subCategory.description || "",
            image: subCategory.image || "",
            parentCategoryId: category._id.toString(),
            isActive: subCategory.isActive,
          })),
        }));

        return formattedCategories;
      } catch (error) {
        console.error(
          `Error fetching categories for restaurant ${parent._id}:`,
          error
        );
        return [];
      }
    },
  },
};
