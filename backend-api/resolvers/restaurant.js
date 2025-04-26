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
const {
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} = require("../helpers/redisCache");

const RESTAURANTS_CACHE_KEY = "restaurants:all";
const RESTAURANT_CACHE_KEY_PREFIX = "restaurant:";
const RESTAURANT_BY_OWNER_CACHE_PREFIX = "restaurant:owner:";
const RESTAURANT_DELIVERY_ZONE_PREFIX = "restaurant:delivery-zone:";
const RESTAURANTS_PREVIEW_CACHE_KEY = "restaurants:preview:all";
const RESTAURANTS_CLONED_CACHE_KEY = "restaurants:cloned:all";
const NEARBY_RESTAURANTS_CACHE_PREFIX = "restaurants:nearby:";
const NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX = "restaurants:nearby:preview:";
const SUBCATEGORIES_CACHE_PREFIX = "subcategories:";
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL) || 3600;

module.exports = {
  Query: {
    restaurants: async () => {
      try {
        const cachedRestaurants = await getCache(RESTAURANTS_CACHE_KEY);
        if (cachedRestaurants) {
          console.log("✅ CACHE HIT: Returning restaurants from Redis cache");
          return cachedRestaurants;
        }

        console.log("❌ CACHE MISS: Fetching restaurants from database");
        const restaurants = await Restaurant.find();
        const transformedRestaurants = transformRestaurants(restaurants);

        await setCache(
          RESTAURANTS_CACHE_KEY,
          transformedRestaurants,
          DEFAULT_TTL
        );
        return transformedRestaurants;
      } catch (err) {
        console.error("Error in restaurants resolver:", err);
        throw err;
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

        const cacheKey = `${RESTAURANT_CACHE_KEY_PREFIX}${
          filters.slug || filters._id
        }`;
        const cachedRestaurant = await getCache(cacheKey);

        if (cachedRestaurant) {
          console.log(
            `✅ CACHE HIT: Returning restaurant from Redis cache for key ${cacheKey}`
          );
          return cachedRestaurant;
        }

        console.log("❌ CACHE MISS: Finding restaurant with filters:", filters);
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
        await setCache(cacheKey, transformedRestaurant, DEFAULT_TTL);
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
        const cacheKey = `${RESTAURANT_BY_OWNER_CACHE_PREFIX}${id}`;

        const cachedOwner = await getCache(cacheKey);
        if (cachedOwner) {
          console.log(
            `✅ CACHE HIT: Returning owner's restaurant from Redis cache for owner ${id}`
          );
          return cachedOwner;
        }

        console.log(`❌ CACHE MISS: Fetching owner ${id} from database`);
        const owner = await Owner.findById(id);
        const transformedOwner = transformOwner(owner);

        await setCache(cacheKey, transformedOwner, DEFAULT_TTL);
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
        const cacheKey = `${RESTAURANT_DELIVERY_ZONE_PREFIX}${id}`;

        const cachedZoneInfo = await getCache(cacheKey);
        if (cachedZoneInfo) {
          console.log(
            `✅ CACHE HIT: Returning delivery zone info from Redis cache for restaurant ${id}`
          );
          return cachedZoneInfo;
        }

        console.log(
          `❌ CACHE MISS: Fetching delivery zone info for restaurant ${id}`
        );
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

        await setCache(cacheKey, zoneInfo, DEFAULT_TTL);
        return zoneInfo;
      } catch (e) {
        console.error("Error in getRestaurantDeliveryZoneInfo resolver:", e);
        throw e;
      }
    },

    restaurantsPreview: async (_) => {
      console.log("restaurantsPreview");
      try {
        const cachedPreview = await getCache(RESTAURANTS_PREVIEW_CACHE_KEY);
        if (cachedPreview) {
          console.log(
            "✅ CACHE HIT: Returning restaurants preview from Redis cache"
          );
          return cachedPreview;
        }

        console.log(
          "❌ CACHE MISS: Fetching restaurants preview from database"
        );
        const restaurants = await Restaurant.find();
        const transformedRestaurants = transformMinimalRestaurants(restaurants);

        await setCache(
          RESTAURANTS_PREVIEW_CACHE_KEY,
          transformedRestaurants,
          DEFAULT_TTL
        );
        return transformedRestaurants;
      } catch (e) {
        console.error("Error in restaurantsPreview resolver:", e);
        throw e;
      }
    },

    restaurantPreview: async (_, args, { req }) => {
      console.log("restaurantPreview", args);
      try {
        const cacheKey = `${RESTAURANT_CACHE_KEY_PREFIX}preview:${args.id}`;

        const cachedPreview = await getCache(cacheKey);
        if (cachedPreview) {
          console.log(
            `✅ CACHE HIT: Returning restaurant preview from Redis cache for restaurant ${args.id}`
          );
          return cachedPreview;
        }

        console.log(
          `❌ CACHE MISS: Fetching restaurant preview for ${args.id}`
        );
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

        await setCache(cacheKey, preview, DEFAULT_TTL);
        return preview;
      } catch (error) {
        console.error("Error in restaurantPreview:", error);
        throw new Error(`Could not fetch delivery zone info: ${error.message}`);
      }
    },

    getClonedRestaurants: async () => {
      try {
        const cachedCloned = await getCache(RESTAURANTS_CLONED_CACHE_KEY);
        if (cachedCloned) {
          console.log(
            "✅ CACHE HIT: Returning cloned restaurants from Redis cache"
          );
          return cachedCloned;
        }

        console.log("❌ CACHE MISS: Fetching cloned restaurants from database");
        const restaurants = await Restaurant.find({ isCloned: true });
        const transformedRestaurants = restaurants.map((restaurant) =>
          transformRestaurant(restaurant)
        );

        await setCache(
          RESTAURANTS_CLONED_CACHE_KEY,
          transformedRestaurants,
          DEFAULT_TTL
        );
        return transformedRestaurants;
      } catch (error) {
        console.error("Error in getClonedRestaurants resolver:", error);
        throw new Error(`Could not fetch cloned restaurants: ${error.message}`);
      }
    },

    nearByRestaurants: async (_, { latitude, longitude, shopType }) => {
      try {
        if (!latitude || !longitude) {
          throw new Error("Latitude and Longitude are required.");
        }

        const cacheKey = `${NEARBY_RESTAURANTS_CACHE_PREFIX}${latitude}_${longitude}_${
          shopType || "all"
        }`;

        const cachedNearby = await getCache(cacheKey);
        if (cachedNearby) {
          console.log(
            `✅ CACHE HIT: Returning nearby restaurants from Redis cache for location ${latitude},${longitude}`
          );
          return cachedNearby;
        }

        console.log(
          `❌ CACHE MISS: Fetching nearby restaurants for location ${latitude},${longitude}`
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
          .populate("options")
          .populate({
            path: "categories.foods",
            model: "Food",
            populate: {
              path: "variations.addons",
              model: "Addon",
            },
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

        await setCache(cacheKey, result, DEFAULT_TTL);
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

        const cacheKey = `${NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX}${latitude}_${longitude}_${
          shopType || "all"
        }`;

        const cachedNearbyPreview = await getCache(cacheKey);
        if (cachedNearbyPreview) {
          console.log(
            `✅ CACHE HIT: Returning nearby restaurants preview from Redis cache for location ${latitude},${longitude}`
          );
          return cachedNearbyPreview;
        }

        console.log(
          `❌ CACHE MISS: Fetching nearby restaurants preview for location ${latitude},${longitude}`
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

        await setCache(cacheKey, result, DEFAULT_TTL);
        return result;
      } catch (error) {
        console.error("Error in nearByRestaurantsPreview:", error);
        throw new Error("Could not fetch nearby restaurants.");
      }
    },

    subCategories: async (_, { categoryId }) => {
      try {
        const cacheKey = `${SUBCATEGORIES_CACHE_PREFIX}${categoryId}`;

        const cachedSubCategories = await getCache(cacheKey);
        if (cachedSubCategories) {
          console.log(
            `✅ CACHE HIT: Returning subcategories from Redis cache for category ${categoryId}`
          );
          return cachedSubCategories;
        }

        console.log(
          `❌ CACHE MISS: Fetching subcategories for category ${categoryId}`
        );
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

        await setCache(cacheKey, subCategories, DEFAULT_TTL);
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

        await clearCachePattern(`${RESTAURANT_BY_OWNER_CACHE_PREFIX}*`);
        await deleteCache(RESTAURANTS_CACHE_KEY);
        await deleteCache(RESTAURANTS_PREVIEW_CACHE_KEY);

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

        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}${id}`);
        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}preview:${id}`);
        await deleteCache(RESTAURANTS_CACHE_KEY);
        await deleteCache(RESTAURANTS_PREVIEW_CACHE_KEY);
        await clearCachePattern(`${NEARBY_RESTAURANTS_CACHE_PREFIX}*`);
        await clearCachePattern(`${NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX}*`);

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

        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}${id}`);
        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}preview:${id}`);
        await deleteCache(RESTAURANTS_CACHE_KEY);
        await deleteCache(RESTAURANTS_PREVIEW_CACHE_KEY);
        await deleteCache(
          `${RESTAURANT_BY_OWNER_CACHE_PREFIX}${restaurant.owner}`
        );
        await clearCachePattern(`${NEARBY_RESTAURANTS_CACHE_PREFIX}*`);
        await clearCachePattern(`${NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX}*`);

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

        await deleteCache(
          `${RESTAURANT_CACHE_KEY_PREFIX}${restaurantInput._id}`
        );
        await deleteCache(
          `${RESTAURANT_CACHE_KEY_PREFIX}preview:${restaurantInput._id}`
        );
        await deleteCache(RESTAURANTS_CACHE_KEY);
        await deleteCache(RESTAURANTS_PREVIEW_CACHE_KEY);
        await clearCachePattern(`${NEARBY_RESTAURANTS_CACHE_PREFIX}*`);
        await clearCachePattern(`${NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX}*`);
        await deleteCache(
          `${RESTAURANT_DELIVERY_ZONE_PREFIX}${restaurantInput._id}`
        );

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

        await deleteCache(RESTAURANTS_CACHE_KEY);
        await deleteCache(RESTAURANTS_PREVIEW_CACHE_KEY);
        await deleteCache(RESTAURANTS_CLONED_CACHE_KEY);
        await deleteCache(`${RESTAURANT_BY_OWNER_CACHE_PREFIX}${owner}`);

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

        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}${id}`);

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
        let updateData = { boundType };

        if (address) updateData.address = address;
        if (postCode) updateData.postCode = postCode;
        if (city) updateData.city = city;

        function isValidPolygonCoordinates(bounds) {
          return (
            Array.isArray(bounds) &&
            bounds.length > 0 &&
            bounds.every((polygon) =>
              polygon.every(
                (point) =>
                  Array.isArray(point) &&
                  point.length === 2 &&
                  point.every((coord) => typeof coord === "number")
              )
            )
          );
        }

        console.log("updateData", updateData);

        if (boundType === "polygon" && isValidPolygonCoordinates(bounds)) {
          updateData.boundType = "polygon";
          updateData.deliveryBounds = {
            type: "Polygon",
            coordinates: bounds,
          };
        } else if (
          boundType === "radius" &&
          circleBounds?.radius &&
          isValidPolygonCoordinates(bounds)
        ) {
          updateData.boundType = "radius";
          updateData.circleBounds = {
            radius: circleBounds.radius,
          };
          updateData.deliveryBounds = {
            coordinates: bounds,
          };
        } else if (
          boundType === "point" &&
          location &&
          location.latitude &&
          location.longitude
        ) {
          updateData.boundType = "point";
          updateData.location = {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          };
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        );
        if (!updatedRestaurant) {
          return { success: false, message: "Restaurant not found" };
        }

        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}${id}`);
        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}preview:${id}`);
        await deleteCache(`${RESTAURANT_DELIVERY_ZONE_PREFIX}${id}`);
        await clearCachePattern(`${NEARBY_RESTAURANTS_CACHE_PREFIX}*`);
        await clearCachePattern(`${NEARBY_RESTAURANTS_PREVIEW_CACHE_PREFIX}*`);

        return {
          success: true,
          message: "Delivery bounds and location updated successfully",
          data: {
            _id: updatedRestaurant._id,
            deliveryBounds: updatedRestaurant.deliveryBounds,
            location: updatedRestaurant.location,
          },
        };
      } catch (error) {
        console.log(error);
        throw error;
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

        await deleteCache(`${RESTAURANT_CACHE_KEY_PREFIX}${id}`);

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
        console.log(`No options found for restaurant ${parent._id}`);
        return [];
      }

      console.log(
        `Found ${parent.options.length} options for restaurant ${parent._id}`
      );

      return parent.options.map((option) => ({
        _id: option._id || new mongoose.Types.ObjectId(),
        title: option.title,
        description: option.description || "",
        price: option.price,
        restaurant: parent._id,
        isActive: option.isActive !== undefined ? option.isActive : true,
        options: [
          {
            _id: option._id || new mongoose.Types.ObjectId(),
            title: option.title,
            description: option.description || "",
            price: option.price,
          },
        ],
      }));
    },
    addons: async (parent) => {
      console.log(`Getting addons for restaurant ${parent._id}`);
      try {
        const cacheKey = `${RESTAURANT_CACHE_KEY_PREFIX}${parent._id}:addons`;

        const cachedAddons = await getCache(cacheKey);
        if (cachedAddons) {
          console.log(
            `✅ CACHE HIT: Returning addons from Redis cache for restaurant ${parent._id}`
          );
          return cachedAddons;
        }

        console.log(
          `❌ CACHE MISS: Fetching addons for restaurant ${parent._id}`
        );

        if (!parent.addons || parent.addons.length === 0) {
          console.log(`No addons found for restaurant ${parent._id}`);
          return [];
        }

        const addons = parent.addons.map((addon) => ({
          _id: addon._id || new mongoose.Types.ObjectId(),
          title: addon.title,
          description: addon.description || "",
          price: addon.price,
          restaurant: parent._id,
          isActive: addon.isActive !== undefined ? addon.isActive : true,
        }));

        await setCache(cacheKey, addons, DEFAULT_TTL);
        return addons;
      } catch (error) {
        console.error(
          `Error fetching addons for restaurant ${parent._id}:`,
          error
        );
        return [];
      }
    },
    categories: async (parent) => {
      console.log(`Getting categories for restaurant ${parent._id}`)
      try {
        const cacheKey = `${RESTAURANT_CACHE_KEY_PREFIX}${parent._id}:categories`
        
        const cachedCategories = await getCache(cacheKey)
        if (cachedCategories) {
          console.log(`✅ CACHE HIT: Returning categories from Redis cache for restaurant ${parent._id}`)
          return cachedCategories
        }
        
        console.log(`❌ CACHE MISS: Fetching categories for restaurant ${parent._id}`)
        
        if (!parent.categories || parent.categories.length === 0) {
          console.log(`No categories found for restaurant ${parent._id}`)
          return []
        }
        
        const categories = parent.categories.map(category => ({
          _id: category._id || new mongoose.Types.ObjectId(),
          title: category.title,
          description: category.description || "",
          foods: category.foods || [],
          restaurant: parent._id,
          isActive: category.isActive !== undefined ? category.isActive : true,
          subCategories: category.subCategories || []
        }))
        
        await setCache(cacheKey, categories, DEFAULT_TTL)
        return categories
      } catch (error) {
        console.error(`Error fetching categories for restaurant ${parent._id}:`, error)
        return []
      }
    }
  },
};
