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
const Option = require("../models/option");
const { orderQueue } = require("../queue/index");
const Food = require("../models/food");
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
  publishToUser,
  publishToDashboard,
  publishToDispatcher,
} = require("../helpers/pubsub");

const { PLACE_ORDER } = require("../constants/subscriptionEvents");

const { pubsub } = require("../config/pubsub");
var DELIVERY_CHARGES = 0.0;

module.exports = {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: () => pubsub.asyncIterator([PLACE_ORDER]),
    },
  },
  Query: {
    ordersByRestIdWithoutPagination: async (_, args) => {
      try {
        const { restaurant, search } = args;

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

        return orders;
      } catch (err) {
        console.error("Error fetching orders:", err);
        throw new Error("Failed to fetch restaurant orders");
      }
    },
    allOrdersWithoutPagination: async (_, args) => {
      try {
        const { dateKeyword, starting_date, ending_date } = args;

        const filter = {};

        if (dateKeyword === "All") {
          if (starting_date && ending_date) {
            filter.createdAt = {
              $gte: new Date(starting_date),
              $lte: new Date(ending_date),
            };
          }
        }

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
        return orders;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
      }
    },
    order: async (_, args, { req, res }) => {
      console.log("order");
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(order);

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
        const paypal = await Paypal.findById(args.id);
        console.log("PAYPAL: ", paypal);
        if (!paypal) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(paypal);

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
        const stripe = await Stripe.findById(args.id);
        console.log("STRIPE: ", stripe);
        if (!stripe) throw new Error("Order does not exist");

        const transformedOrder = transformOrder(stripe);

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
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50)
          .populate({
            path: "items",
            populate: [
              {
                path: "addons",
                model: "Addon",
                populate: {
                  path: "options",
                  model: "Option",
                },
              },
              {
                path: "variation", // Ajouter la population pour les variations des items
                model: "Variation",
              },
            ],
          });
        const filterOrders = orders.filter((order) => order.restaurant);

        const transformedOrders = filterOrders.map((order) => {
          return transformOrder(order);
        });

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    getOrdersByDateRange: async (_, args, context) => {
      try {
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

        return result;
      } catch (err) {
        throw err;
      }
    },
    ordersByRestId: async (_, args, context) => {
      console.log("restaurant orders");
      try {
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

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    allOrders: async (_, args, context) => {
      try {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10);

        const transformedOrders = orders.map((order) => {
          return transformOrder(order);
        });

        return transformedOrders;
      } catch (err) {
        throw err;
      }
    },
    pageCount: async (_, args, context) => {
      try {
        const orderCount = await Order.countDocuments({
          restaurant: args.restaurant,
        });
        const pageCount = Math.ceil(orderCount / 10);

        return pageCount;
      } catch (err) {
        throw err;
      }
    },
    orderCount: async (_, args, context) => {
      try {
        const orderCount = await Order.find({
          isActive: true,
          restaurant: args.restautant,
        }).countDocuments();

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
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
          .populate("review");

        const transformedReviews = transformReviews(orders);

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
        const config = await Configuration.findOne();
        const maxDistanceInMeters = config?.maxDistanceInMeters;
        console.log(maxDistanceInMeters);

        const restaurant = await Restaurant.findById(args.restaurant).populate({
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
                model: "Addon",
              },
            },
          },
        });

        const location = new Point({
          type: "Point",
          coordinates: [+args.address.longitude, +args.address.latitude],
        });
        // 1. verify user location is near to restaurant
        const isNear = await Restaurant.findOne({
          _id: args.restaurant,
          location: {
            $near: {
              $geometry: location,
              $maxDistance: maxDistanceInMeters,
            },
          },
        });

        if (!isNear && args.isPickedUp !== true) {
          throw new Error("Sorry! we can't deliver to your address.,,");
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
          const allSelectedOptionRefs = [];

          item.addons.forEach((data) => {
            data.options.forEach((option) => {
              const optionDoc = availableOptions.find(
                (op) => op._id.toString() === option
              );
              if (optionDoc) {
                allSelectedOptionRefs.push(optionDoc._id);
              }
            });

            const adds = availableAddons.find(
              (addon) => addon._id.toString() === data._id.toString()
            );

            if (adds) {
              addonList.push(adds._id);
            }
          });

          const itemData = new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList.map((a) => a._id),
            options: allSelectedOptionRefs,
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
          console.log("ItemsData", ItemsData);
          // Si l'item a des addons
          if (item.addons && item.addons.length > 0) {
            const addonDetails = [];

            // Recherche de tous les options à partir des références stockées dans `options`
            const allOptions = await Option.find({
              _id: { $in: item.options },
            }); // Requête pour récupérer toutes les options par leurs références
            allOptions.forEach((option) => {
              itemPrice += option.price; // Ajout du prix de l'option au prix de l'item
              addonDetails.push(
                `${option.title} ${configuration.currencySymbol}${option.price}` // Détails de l'addon
              );
            });
          }

          // Ajout du prix total de l'item avec la quantité
          price += itemPrice * item.quantity;

          return `${item.quantity} x ${item.title}${
            item.variation.title ? `(${item.variation.title})` : ""
          } ${configuration.currencySymbol}${item.variation.price}`;
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
          items: ItemsData.map((i) => i._id),
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
          const populatedOrder = await Order.populate(order, {
            path: "items",
            populate: [
              {
                path: "addons",
                model: "Addon",
                populate: {
                  path: "options",
                  model: "Option",
                },
              },
              {
                path: "variation", // Ajout de la population pour la variation
                model: "Variation",
              },
            ],
          });
          result = await populatedOrder.save();

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
        } else if (args.paymentMethod === "PAYPAL") {
          orderObj.paymentMethod = args.paymentMethod;
          const paypal = new Paypal(orderObj);
          result = await paypal.save();

          const transformedOrder = await transformOrder(result);
        } else if (args.paymentMethod === "STRIPE") {
          console.log("stripe");
          orderObj.paymentMethod = args.paymentMethod;
          const stripe = new Stripe(orderObj);
          result = await stripe.save();
          console.log(result);

          const transformedOrder = await transformOrder(result);
        } else {
          throw new Error("Invalid Payment Method");
        }
        const orderResult = await transformOrder(result);

        await orderQueue.add("proccess_order", {
          orderId: orderResult._id,
          orderData: orderResult,
        });

        pubsub.publish(PLACE_ORDER, {
          subscribePlaceOrder: {
            userId: req.userId,
            order: orderResult,
            origin: "order_placed",
          },
        });

        return orderResult;
      } catch (err) {
        throw err;
      }
    },

    updateOrderStatus: async (_, args, context) => {
      console.log("updateOrderStatus");
      try {
        const order = await Order.findById(args.id).populate({
          path: "items",
          populate: [
            {
              path: "addons",
              model: "Addon",
              populate: {
                path: "options",
                model: "Option",
              },
            },
            {
              path: "variation",
              model: "Variation",
            },
          ],
        });

        const restaurant = await Restaurant.findById(order.restaurant);
        if (args.status === "ACCEPTED") {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          );
        }
        order.orderStatus = args.status;
        order.reason = args.reason;

        if (args.status === "ACCEPTED") {
          order.acceptedAt = new Date();
        } else if (args.status === "PICKED") {
          order.pickedAt = new Date();
        } else if (args.status === "DELIVERED") {
          order.deliveredAt = new Date();
        } else if (args.status === "CANCELLED") {
          order.cancelledAt = new Date();
        } else if (args.status === "ASSIGNED") {
          order.assignedAt = new Date();
        }

        const result = await order.save();
        const populatedOrder = await Order.findById(result._id).populate({
          path: "items",
          populate: [
            {
              path: "addons",
              model: "Addon",
              populate: {
                path: "options",
                model: "Option",
              },
            },
            {
              path: "variation",
              model: "Variation",
            },
          ],
        });
        const transformedOrder = await transformOrder(populatedOrder);

        const user = await User.findById(order.user);
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
    editOrder: async (_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }
      try {
        const items = args.orderInput.map(async function (item) {
          // Récupérer les informations de l'aliment pour obtenir le titre
          const foodItem = await Food.findById(item.food);
          if (!foodItem) {
            throw new Error(`Food with ID ${item.food} not found`);
          }

          const newItem = new Item({
            ...item,
            title: foodItem.title, // Utiliser le titre de l'aliment
            description: foodItem.description || "", // Potentiellement ajouter d'autres champs
            image: foodItem.image || "",
            isActive: true,
          });

          const result = await newItem.save();
          return result._id;
        });

        // Le reste de votre code reste inchangé
        const completed = await Promise.all(items);
        const order = await Order.findOne({ _id: args._id, user: req.userId });
        if (!order) {
          throw new Error("order does not exist");
        }

        order.items = completed;
        const result = await order.save();

        const populatedOrder = await Order.findById(result._id).populate({
          path: "items",
          populate: [
            {
              path: "addons",
              model: "Addon",
              populate: {
                path: "options",
                model: "Option",
              },
            },
            {
              path: "variation",
              model: "Variation",
            },
          ],
        });

        const transformedOrder = await transformOrder(populatedOrder);

        return transformedOrder;
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

      return transformedOrder;
    },
  },
};
