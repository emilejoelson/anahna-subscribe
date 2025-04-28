const path = require("path");
const User = require("../models/user");
const Rider = require("../models/rider");
const Order = require("../models/order");
const Item = require("../models/item");
const Coupon = require("../models/coupon");
const Point = require("../models/point");
const Zone = require("../models/zone");
const Restaurant = require("../models/restaurant");
const Configuration = require("../models/configuration");
const Paypal = require("../models/paypal");
const Stripe = require("../models/stripe");
const {
  sendNotificationToCustomerWeb,
} = require("../helpers/firebase-web-notifications");
const { transformOrder, transformReviews } = require("./merge");
const {
  payment_status,
  order_status,
  ORDER_STATUS,
} = require("../helpers/enum");
const { sendEmail } = require("../helpers/email");
const { sendNotification, calculateDistance } = require("../helpers/utilities");
const { placeOrderTemplate } = require("../helpers/templates");
const {
  sendNotificationToRestaurant,
  sendNotificationToUser,
} = require("../helpers/notifications");
const { withFilter } = require("graphql-subscriptions");
const {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishOrder,
  publishToDispatcher,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  SUBSCRIPTION_ORDER,
} = require("../helpers/pubsub");
const {
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} = require("../helpers/redisCache");

const ORDERS_CACHE_KEY = "orders:all";
const ORDER_CACHE_KEY_PREFIX = "order:";
const RESTAURANT_ORDERS_PREFIX = "restaurant:orders:";
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL) || 3600;

var DELIVERY_CHARGES = 0.0;

module.exports = {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PLACE_ORDER),
        (payload, args, context) => {
          const restaurantId = payload.subscribePlaceOrder.restaurantId;
          console.log("restaurantId", restaurantId);
          return restaurantId === args.restaurant;
        }
      ),
    },
    orderStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_STATUS_CHANGED),
        (payload, args, context) => {
          const userId = payload.orderStatusChanged.userId.toString();
          return userId === args.userId;
        }
      ),
    },
    subscriptionAssignRider: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ASSIGN_RIDER),
        (payload, args) => {
          const riderId = payload.subscriptionAssignRider.userId.toString();
          return riderId === args.riderId;
        }
      ),
    },
    subscriptionOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_ORDER),
        (payload, args) => {
          const orderId = payload.subscriptionOrder._id.toString();
          return orderId === args.id;
        }
      ),
    },
  },
  Query: {
    ordersByRestIdWithoutPagination: async (_, args) => {
      try {
        const { restaurant, search } = args;
        const cacheKey = `${RESTAURANT_ORDERS_PREFIX}${restaurant}:${
          search || "all"
        }`;

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(
            `✅ CACHE HIT: Returning restaurant ${restaurant} orders from Redis cache`
          );
          return cachedOrders;
        }

        console.log(
          `❌ CACHE MISS: Fetching restaurant ${restaurant} orders from database`
        );

        const filter = {
          restaurant: restaurant,
        };

        if (search && search.trim() !== "") {
          filter.orderId = { $regex: search, $options: "i" };
        }

        const orders = await Order.find(filter)
          .populate("user", "_id name phone email")
          .populate("restaurant", "_id name address location image")
          .populate("rider", "_id name username available")
          .populate("zone")
          .populate({
            path: "items",
            populate: [
              {
                path: "variation",
                select: "_id title price discounted",
              },
              {
                path: "addons",
                populate: {
                  path: "options",
                  select: "_id title description price",
                },
              },
            ],
          })
          .lean();

        console.log("===orders", orders);

        await setCache(cacheKey, orders);

        return orders;
      } catch (err) {
        console.error("Error fetching orders:", err);
        throw new Error("Failed to fetch restaurant orders");
      }
    },
    allOrdersWithoutPagination: async (_, args) => {
      try {
        const { dateKeyword, starting_date, ending_date } = args;

        let cacheKey = `${ORDERS_CACHE_KEY}:${dateKeyword || "all"}`;
        if (starting_date && ending_date) {
          cacheKey += `:${starting_date}-${ending_date}`;
        }

        // For debugging, clear the cache (remove in production)
        await deleteCache(cacheKey);

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log("✅ CACHE HIT: Returning all orders from Redis cache");
          return cachedOrders;
        }

        console.log("❌ CACHE MISS: Fetching all orders from database");
        console.log("Filter parameters:", {
          dateKeyword,
          starting_date,
          ending_date,
        });

        const filter = {};

        // Handle different date filters
        const now = new Date();

        if (dateKeyword === "Today") {
          // Start of today
          const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          // End of today
          const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          );

          filter.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay,
          };
        } else if (dateKeyword === "Week") {
          // Start of this week (Sunday)
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          // End of this week (Saturday)
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          filter.createdAt = {
            $gte: startOfWeek,
            $lte: endOfWeek,
          };
        } else if (dateKeyword === "Month") {
          // Start of this month
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          // End of this month
          const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );

          filter.createdAt = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
        } else if (dateKeyword === "Year") {
          // Start of this year
          const startOfYear = new Date(now.getFullYear(), 0, 1);

          // End of this year
          const endOfYear = new Date(
            now.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
          );

          filter.createdAt = {
            $gte: startOfYear,
            $lte: endOfYear,
          };
        }else if (dateKeyword === "Custom") {
          // For Custom dateKeyword, always apply the date range if provided
          if (starting_date && ending_date) {
            // Make sure to include the entire day for the end date
            const endDate = new Date(ending_date);
            endDate.setHours(23, 59, 59, 999);

            filter.createdAt = {
              $gte: new Date(starting_date),
              $lte: endDate,
            };
          } else {
            // If Custom is selected but no date range provided, use last 30 days as default
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);

            filter.createdAt = {
              $gte: thirtyDaysAgo,
              $lte: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999
              ),
            };
          }
        } else if (
          dateKeyword !== "All" &&
          dateKeyword.toLowerCase() !== "all"
        ) {
          // If dateKeyword is provided but not 'All', and not one of the above cases,
          // apply custom date filter if provided
          if (starting_date && ending_date) {
            // Make sure to include the entire day for the end date
            const endDate = new Date(ending_date);
            endDate.setHours(23, 59, 59, 999);

            filter.createdAt = {
              $gte: new Date(starting_date),
              $lte: endDate,
            };
          }
        }
        // For 'All', we don't apply any date filter - this will return ALL orders

        console.log("Final filter:", JSON.stringify(filter));

        // Fetch orders with the filter
        const orders = await Order.find(filter)
          .populate("restaurant", "_id name image address location")
          .populate("user", "_id name phone email")
          .populate("rider", "_id name username available")
          .populate({
            path: "items",
            populate: [
              { path: "variation", select: "_id title price discounted" },
              {
                path: "addons",
                populate: {
                  path: "options",
                  select: "_id title description price",
                },
              },
            ],
          })
          .lean()
          .exec();

        console.log(`Found ${orders.length} orders matching filter`);

        // If no orders found, check if there are any orders at all (for debugging)
        if (orders.length === 0) {
          const totalOrders = await Order.countDocuments({});
          console.log(`Total orders in database: ${totalOrders}`);

          // Check a few recent orders for debugging
          if (totalOrders > 0) {
            const sampleOrders = await Order.find({})
              .sort({ createdAt: -1 })
              .limit(5)
              .select("createdAt")
              .lean();
            console.log(
              "Sample recent order dates:",
              sampleOrders.map((order) => order.createdAt)
            );
          }
        }

        // Clean up the data to handle null values before returning
        const processedOrders = orders.map((order) => {
          // Process items
          if (order.items && Array.isArray(order.items)) {
            order.items = order.items.map((item) => {
              // Handle missing fields in items
              if (item) {
                // Default values for missing item fields
                if (item.isActive === null || item.isActive === undefined) {
                  item.isActive = false;
                }

                // Handle missing variation
                if (!item.variation) {
                  item.variation = {
                    _id: null,
                    title: "",
                    price: 0,
                    discounted: 0,
                  };
                }

                // Handle addons
                if (item.addons && Array.isArray(item.addons)) {
                  item.addons = item.addons.map((addon) => {
                    if (addon) {
                      // Default values for missing addon fields
                      if (addon.title === null || addon.title === undefined) {
                        addon.title = "";
                      }
                      if (
                        addon.quantityMinimum === null ||
                        addon.quantityMinimum === undefined
                      ) {
                        addon.quantityMinimum = 0;
                      }
                      if (
                        addon.quantityMaximum === null ||
                        addon.quantityMaximum === undefined
                      ) {
                        addon.quantityMaximum = 0;
                      }

                      // Handle options
                      if (addon.options && Array.isArray(addon.options)) {
                        addon.options = addon.options.map((option) => {
                          return (
                            option || {
                              _id: null,
                              title: "",
                              description: "",
                              price: 0,
                            }
                          );
                        });
                      } else {
                        addon.options = [];
                      }
                      return addon;
                    }
                    return {
                      _id: "",
                      title: "",
                      description: "",
                      quantityMinimum: 0,
                      quantityMaximum: 0,
                      options: [],
                    };
                  });
                } else {
                  item.addons = [];
                }
              }
              return item || {};
            });
          } else {
            order.items = [];
          }

          // Handle missing restaurant data
          if (!order.restaurant) {
            order.restaurant = {
              _id: "",
              name: "",
              image: "",
              address: "",
              location: { coordinates: [0, 0] },
            };
          }

          // Handle missing user data
          if (!order.user) {
            order.user = {
              _id: "",
              name: "",
              phone: "",
              email: "",
            };
          }

          // Handle missing delivery address
          if (!order.deliveryAddress) {
            order.deliveryAddress = {
              location: { coordinates: [0, 0] },
              deliveryAddress: "",
              details: "",
              label: "",
            };
          }

          return order;
        });

        await setCache(cacheKey, processedOrders, DEFAULT_TTL);

        return processedOrders;
      } catch (error) {
        console.error("Error fetching orders:", error, error.stack);
        throw new Error("Failed to fetch orders: " + error.message);
      }
    },
    order: async (_, args, { req, res }) => {
      console.log("order");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `${ORDER_CACHE_KEY_PREFIX}${args.id}`;

        const cachedOrder = await getCache(cacheKey);
        if (cachedOrder) {
          console.log(
            `✅ CACHE HIT: Returning order ${args.id} from Redis cache`
          );
          return cachedOrder;
        }

        console.log(`❌ CACHE MISS: Fetching order ${args.id} from database`);

        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(order);
        await setCache(cacheKey, transformedOrder);

        return transformedOrder;
      } catch (err) {
        throw err;
      }
    },
    orderPaypal: async (_, args, { req, res }) => {
      console.log("orderPaypal");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `paypal:${ORDER_CACHE_KEY_PREFIX}${args.id}`;

        const cachedOrder = await getCache(cacheKey);
        if (cachedOrder) {
          console.log(
            `✅ CACHE HIT: Returning paypal order ${args.id} from Redis cache`
          );
          return cachedOrder;
        }

        console.log(
          `❌ CACHE MISS: Fetching paypal order ${args.id} from database`
        );

        const paypal = await Paypal.findById(args.id);
        console.log("PAYPAL: ", paypal);
        if (!paypal) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(paypal);
        await setCache(cacheKey, transformedOrder);

        return transformedOrder;
      } catch (err) {
        throw err;
      }
    },
    orderStripe: async (_, args, { req, res }) => {
      console.log("orderStripe");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `stripe:${ORDER_CACHE_KEY_PREFIX}${args.id}`;

        const cachedOrder = await getCache(cacheKey);
        if (cachedOrder) {
          console.log(
            `✅ CACHE HIT: Returning stripe order ${args.id} from Redis cache`
          );
          return cachedOrder;
        }

        console.log(
          `❌ CACHE MISS: Fetching stripe order ${args.id} from database`
        );

        const stripe = await Stripe.findById(args.id);
        console.log("STRIPE: ", stripe);
        if (!stripe) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(stripe);
        await setCache(cacheKey, transformedOrder);

        return transformedOrder;
      } catch (err) {
        throw err;
      }
    },
    orders: async (_, args, { req }) => {
      console.log("isAuth", req.isAuth, req.userId, req.userType);
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `user:${req.userId}:orders:${args.offset || 0}`;

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(
            `✅ CACHE HIT: Returning user ${req.userId} orders from Redis cache`
          );
          return cachedOrders;
        }

        console.log(
          `❌ CACHE MISS: Fetching user ${req.userId} orders from database`
        );

        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50);
        const filterOrders = orders.filter((order) => order.restaurant);

        const transformedOrders = filterOrders.map((order) => {
          return transformOrder(order);
        });

        await setCache(cacheKey, transformedOrders);

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    getOrdersByDateRange: async (_, args, context) => {
      try {
        const cacheKey = `restaurant:${args.restaurant}:dateRange:${args.startingDate}-${args.endingDate}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
          console.log(
            `✅ CACHE HIT: Returning orders by date range from Redis cache`
          );
          return cachedData;
        }

        console.log(
          `❌ CACHE MISS: Fetching orders by date range from database`
        );

        const orders = await Order.find({
          restaurant: args.restaurant,
          createdAt: {
            $gte: new Date(args.startingDate),
            $lt: new Date(args.endingDate),
          },
        }).sort({ createdAt: -1 });

        const cashOnDeliveryOrders = orders.filter(
          (order) =>
            order.paymentMethod === "COD" && order.orderStatus === "DELIVERED"
        );

        const totalAmountCashOnDelivery = cashOnDeliveryOrders
          .reduce((total, order) => total + parseFloat(order.orderAmount), 0)
          .toFixed(2);

        const countCashOnDeliveryOrders = cashOnDeliveryOrders.length;

        const result = {
          orders: orders.map((order) => transformOrder(order)),
          totalAmountCashOnDelivery,
          countCashOnDeliveryOrders,
        };

        await setCache(cacheKey, result);

        return result;
      } catch (err) {
        throw err;
      }
    },
    ordersByRestId: async (_, args, context) => {
      console.log("restaurant orders");
      try {
        let cacheKey;
        if (args.search) {
          cacheKey = `${RESTAURANT_ORDERS_PREFIX}${args.restaurant}:search:${args.search}`;
        } else {
          cacheKey = `${RESTAURANT_ORDERS_PREFIX}${args.restaurant}:page:${
            args.page || 0
          }:rows:${args.rows}`;
        }

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(
            `✅ CACHE HIT: Returning restaurant orders from Redis cache`
          );
          return cachedOrders;
        }

        console.log(`❌ CACHE MISS: Fetching restaurant orders from database`);

        let orders = [];
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, (c) => "\\" + c),
            "i"
          );
          orders = await Order.find({
            restaurant: args.restaurant,
            orderId: search,
          }).sort({ createdAt: -1 });
        } else {
          orders = await Order.find({ restaurant: args.restaurant })
            .sort({ createdAt: -1 })
            .skip((args.page || 0) * args.rows)
            .limit(args.rows);
        }

        const transformedOrders = orders.map((order) => {
          return transformOrder(order);
        });

        await setCache(cacheKey, transformedOrders);

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    undeliveredOrders: async (_, args, { req, res }) => {
      console.log("undeliveredOrders");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `user:${req.userId}:undeliveredOrders:${
          args.offset || 0
        }`;

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(
            `✅ CACHE HIT: Returning undelivered orders from Redis cache`
          );
          return cachedOrders;
        }

        console.log(`❌ CACHE MISS: Fetching undelivered orders from database`);

        const orders = await Order.find({
          user: req.userId,
          $or: [
            { orderStatus: "PENDING" },
            { orderStatus: "PICKED" },
            { orderStatus: "ACCEPTED" },
          ],
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10);

        const transformedOrders = orders.map((order) => {
          return transformOrder(order);
        });

        await setCache(cacheKey, transformedOrders);

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    deliveredOrders: async (_, args, { req, res }) => {
      console.log("deliveredOrders");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const cacheKey = `user:${req.userId}:deliveredOrders:${
          args.offset || 0
        }`;

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(
            `✅ CACHE HIT: Returning delivered orders from Redis cache`
          );
          return cachedOrders;
        }

        console.log(`❌ CACHE MISS: Fetching delivered orders from database`);

        const orders = await Order.find({
          user: req.userId,
          $or: [{ orderStatus: "DELIVERED" }, { orderStatus: "COMPLETED" }],
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10);

        const transformedOrders = orders.map((order) => {
          return transformOrder(order);
        });

        await setCache(cacheKey, transformedOrders);

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    allOrders: async (_, args, context) => {
      try {
        const cacheKey = `${ORDERS_CACHE_KEY}:page:${args.page || 0}`;

        const cachedOrders = await getCache(cacheKey);
        if (cachedOrders) {
          console.log(`✅ CACHE HIT: Returning all orders from Redis cache`);
          return cachedOrders;
        }

        console.log(`❌ CACHE MISS: Fetching all orders from database`);

        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10);

        const transformedOrders = orders.map((order) => {
          return transformOrder(order);
        });

        await setCache(cacheKey, transformedOrders);

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    pageCount: async (_, args, context) => {
      try {
        const cacheKey = `restaurant:${args.restaurant}:pageCount`;

        const cachedCount = await getCache(cacheKey);
        if (cachedCount !== null) {
          console.log(`✅ CACHE HIT: Returning page count from Redis cache`);
          return cachedCount;
        }

        console.log(`❌ CACHE MISS: Calculating page count from database`);

        const orderCount = await Order.countDocuments({
          restaurant: args.restaurant,
        });
        const pageCount = Math.ceil(orderCount / 10);

        await setCache(cacheKey, pageCount);

        return pageCount;
      } catch (err) {
        throw err;
      }
    },
    orderCount: async (_, args, context) => {
      try {
        const cacheKey = `restaurant:${args.restautant}:orderCount`;

        const cachedCount = await getCache(cacheKey);
        if (cachedCount !== null) {
          console.log(`✅ CACHE HIT: Returning order count from Redis cache`);
          return cachedCount;
        }

        console.log(`❌ CACHE MISS: Calculating order count from database`);

        const orderCount = await Order.find({
          isActive: true,
          restaurant: args.restautant,
        }).countDocuments();

        await setCache(cacheKey, orderCount);

        return orderCount;
      } catch (err) {
        throw err;
      }
    },
    reviews: async (_, args, { req, res }) => {
      console.log("reviews");
      if (!req.isAuth) {
        throw new Error("Unauthenticated");
      }
      try {
        const cacheKey = `user:${req.userId}:reviews:${args.offset || 0}`;

        const cachedReviews = await getCache(cacheKey);
        if (cachedReviews) {
          console.log(`✅ CACHE HIT: Returning reviews from Redis cache`);
          return cachedReviews;
        }

        console.log(`❌ CACHE MISS: Fetching reviews from database`);

        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
          .populate("review");

        const transformedReviews = transformReviews(orders);

        await setCache(cacheKey, transformedReviews);

        return transformedReviews;
      } catch (err) {
        throw err;
      }
    },
    getOrderStatuses: async (_, args, context) => {
      return order_status;
    },
    getPaymentStatuses: async (_, args, context) => {
      return payment_status;
    },
  },
  Mutation: {
    placeOrder: async (_, args, { req, res }) => {
      console.log("placeOrder", args.address.longitude, args.address.latitude);
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const restaurant = await Restaurant.findById(args.restaurant);
        const location = new Point({
          type: "Point",
          coordinates: [+args.address.longitude, +args.address.latitude],
        });
        const checkZone = await Restaurant.findOne({
          _id: args.restaurant,
          deliveryBounds: { $geoIntersects: { $geometry: location } },
        });
        if (!checkZone && args.isPickedUp !== true) {
          throw new Error("Sorry! we can't deliver to your address.");
        }
        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: { $geometry: restaurant.location },
          },
        });
        if (!zone) {
          throw new Error("Delivery zone not found");
        }

        const foods = restaurant.categories.map((c) => c.foods).flat();
        const availableAddons = restaurant.addons;
        const availableOptions = restaurant.options;

        const ItemsData = [];

        for (const item of args.orderInput) {
          const food = foods.find(
            (element) => element._id.toString() === item.food
          );
          const variation = food.variations.find(
            (v) => v._id.toString() === item.variation
          );

          const addonList = [];
          item.addons.forEach((data) => {
            const selectedOptions = [];
            data.options.forEach((option) => {
              selectedOptions.push(
                availableOptions.find((op) => op._id.toString() === option)
              );
            });
            const adds = availableAddons.find(
              (addon) => addon._id.toString() === data._id.toString()
            );

            addonList.push({
              ...adds._doc,
              options: selectedOptions,
            });
          });

          const itemData = new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          });

          const savedItem = await itemData.save();

          ItemsData.push(savedItem);
        }

        const user = await User.findById(req.userId);
        if (!user) {
          throw new Error("invalid request");
        }
        let configuration = await Configuration.findOne();
        if (!configuration) {
          configuration = new Configuration();
          await configuration.save();
        }

        const orderid =
          restaurant.orderPrefix + "-" + (Number(restaurant.orderId) + 1);
        restaurant.orderId = Number(restaurant.orderId) + 1;
        await restaurant.save();
        const latOrigin = +restaurant.location.coordinates[1];
        const lonOrigin = +restaurant.location.coordinates[0];
        const latDest = +args.address.latitude;
        const longDest = +args.address.longitude;
        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        );
        const costType = configuration.costType;

        if (costType === "fixed") {
          DELIVERY_CHARGES = configuration.deliveryRate;
        } else {
          DELIVERY_CHARGES = Math.ceil(distance) * configuration.deliveryRate;
        }

        let price = 0.0;

        ItemsData.forEach(async (item) => {
          let itemPrice = item.variation.price;
          if (item.addons && item.addons.length > 0) {
            const addonDetails = [];
            item.addons.forEach(({ options }) => {
              options.forEach((option) => {
                itemPrice = itemPrice + option.price;
                addonDetails.push(
                  `${option.title}	${configuration.currencySymbol}${option.price}`
                );
              });
            });
          }
          price += itemPrice * item.quantity;
          return `${item.quantity} x ${item.title}${
            item.variation.title ? `(${item.variation.title})` : ""
          }	${configuration.currencySymbol}${item.variation.price}`;
        });
        let coupon = null;
        if (args.couponCode) {
          coupon = await Coupon.findOne({ title: args.couponCode });
          if (coupon) {
            price = price - (coupon.discount / 100) * price;
          }
        }
        const orderObj = {
          zone: zone._id,
          restaurant: args.restaurant,
          user: req.userId,
          items: ItemsData,
          deliveryAddress: {
            ...args.address,
            location: location,
          },
          orderId: orderid,
          paidAmount: 0,
          orderStatus: "PENDING",
          deliveryCharges: args.isPickedUp ? 0 : DELIVERY_CHARGES,
          tipping: args.tipping,
          taxationAmount: args.taxationAmount,
          orderDate: args.orderDate,
          isPickedUp: args.isPickedUp,
          orderAmount: (
            price +
            (args.isPickedUp ? 0 : DELIVERY_CHARGES) +
            args.taxationAmount +
            args.tipping
          ).toFixed(2),
          paymentStatus: payment_status[0],
          coupon: coupon,
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          instructions: args.instructions,
        };

        let result = null;
        if (args.paymentMethod === "COD") {
          const order = new Order(orderObj);
          result = await order.save();

          const placeOrder_template = await placeOrderTemplate([
            result.orderId,
            ItemsData,
            args.isPickedUp
              ? restaurant.address
              : result.deliveryAddress.deliveryAddress,
            `${configuration.currencySymbol} ${Number(price).toFixed(2)}`,
            `${configuration.currencySymbol} ${order.tipping.toFixed(2)}`,
            `${configuration.currencySymbol} ${order.taxationAmount.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.deliveryCharges.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.orderAmount.toFixed(2)}`,
            configuration.currencySymbol,
          ]);
          const transformedOrder = await transformOrder(result);

          publishToDashboard(
            order.restaurant.toString(),
            transformedOrder,
            "new"
          );
          publishToDispatcher(transformedOrder);
          const attachment =
            "https://res.cloudinary.com/dzdohbv3s/image/upload/v1745357465/cdmlathwtjtub8ko5z3q.jpg";

          sendEmail(
            user.email,
            "Order Placed",
            "",
            placeOrder_template,
            attachment
          );
          sendNotification(result.orderId);
          sendNotificationToCustomerWeb(
            user.notificationTokenWeb,
            "Order placed",
            `Order ID ${result.orderId}`
          );
          sendNotificationToRestaurant(result.restaurant, result);

          await setCache(
            `${ORDER_CACHE_KEY_PREFIX}${result._id}`,
            transformedOrder
          );
          await clearCachePattern("orders:*");
          await clearCachePattern(`user:${req.userId}:*`);
          await clearCachePattern(`restaurant:${args.restaurant}:*`);
        } else if (args.paymentMethod === "PAYPAL") {
          orderObj.paymentMethod = args.paymentMethod;
          const paypal = new Paypal(orderObj);
          result = await paypal.save();

          const transformedOrder = await transformOrder(result);
          await setCache(
            `paypal:${ORDER_CACHE_KEY_PREFIX}${result._id}`,
            transformedOrder
          );
        } else if (args.paymentMethod === "STRIPE") {
          console.log("stripe");
          orderObj.paymentMethod = args.paymentMethod;
          const stripe = new Stripe(orderObj);
          result = await stripe.save();
          console.log(result);

          const transformedOrder = await transformOrder(result);
          await setCache(
            `stripe:${ORDER_CACHE_KEY_PREFIX}${result._id}`,
            transformedOrder
          );
        } else {
          throw new Error("Invalid Payment Method");
        }
        const orderResult = await transformOrder(result);
        return orderResult;
      } catch (err) {
        throw err;
      }
    },
    editOrder: async (_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const items = args.orderInput.map(async function (item) {
          const newItem = new Item({
            ...item,
          });
          const result = await newItem.save();
          return result._id;
        });
        const completed = await Promise.all(items);
        const order = await Order.findOne({ _id: args._id, user: req.userId });
        if (!order) {
          throw new Error("order does not exist");
        }
        order.items = completed;
        const result = await order.save();

        const transformedOrder = transformOrder(result);

        await setCache(
          `${ORDER_CACHE_KEY_PREFIX}${args._id}`,
          transformedOrder
        );
        await clearCachePattern("orders:*");
        await clearCachePattern(`user:${req.userId}:*`);
        await clearCachePattern(`restaurant:${order.restaurant}:*`);

        return transformedOrder;
      } catch (err) {
        throw err;
      }
    },
    updateOrderStatus: async (_, args, context) => {
      console.log("updateOrderStatus");
      try {
        const order = await Order.findById(args.id);
        const restaurant = await Restaurant.findById(order.restaurant);
        if (args.status === "ACCEPTED") {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          );
        }
        order.orderStatus = args.status;
        order.reason = args.reason;
        const result = await order.save();

        const transformedOrder = await transformOrder(result);
        const user = await User.findById(order.user);
        publishToUser(result.user.toString(), transformedOrder, "update");
        publishOrder(transformedOrder);
        sendNotificationToUser(result.user, result);
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        );
        return transformOrder(result);
      } catch (err) {
        throw err;
      }
    },
    updatePaymentStatus: async (_, args, context) => {
      console.log("updatePaymentStatus", args.id, args.status);
      try {
        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order does not exist");
        order.paymentStatus = args.status;
        order.paidAmount = args.status === "PAID" ? order.orderAmount : 0.0;
        const result = await order.save();
        return transformOrder(result);
      } catch (error) {
        throw error;
      }
    },
    muteRing: async (_, args, { req }) => {
      try {
        const order = await Order.findOne({ orderId: args.orderId });
        if (!order) throw new Error("Order does not exist");
        order.isRinged = false;
        await order.save();
        return true;
      } catch (error) {
        throw error;
      }
    },
    abortOrder: async (_, args, { req }) => {
      console.log("abortOrder", args);
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      const order = await Order.findById(args.id);
      order.orderStatus = ORDER_STATUS.CANCELLED;
      const result = await order.save();

      const transformedOrder = await transformOrder(result);
      publishOrder(transformedOrder);

      return transformedOrder;
    },
  },
};
