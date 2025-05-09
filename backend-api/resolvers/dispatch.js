/* eslint-disable no-tabs */
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const Order = require("../models/order");
const Rider = require("../models/rider");
const Restaurant = require("../models/restaurant");
const {
  DISPATCH_ORDER,
  publishOrder,
  publishToAssignedRider,
  publishToZoneRiders,
  publishToUser,
} = require("../helpers/pubsub");
const { pubsub } = require("../config/pubsub");
const {
  ORDER_STATUS_CHANGED,
  RIDER_ASSIGNED,
  SUBSCRIPTION_ORDER,
} = require("../constants/subscriptionEvents");
const { transformOrder, transformRider } = require("./merge");
const {
  sendNotificationToUser,
  sendNotificationToZoneRiders,
  sendNotificationToRider,
} = require("../helpers/notifications");
const { order_status } = require("../helpers/enum");
const { formatOrderDate } = require("../helpers/date");

// Valid order statuses
const VALID_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "ASSIGNED",
  "PREPARING",
  "PICKED",
  "DELIVERED",
  "CANCELLED",
];

module.exports = {
  Subscription: {
    subscriptionDispatcher: {
      subscribe: () => pubsub.asyncIterator(DISPATCH_ORDER),
    },
    orderStatusChanged: {
      subscribe: () => pubsub.asyncIterator([ORDER_STATUS_CHANGED]),
    },
    subscriptionAssignRider: {
      subscribe: () => pubsub.asyncIterator([RIDER_ASSIGNED]),
    },
    subscriptionOrder: {
      subscribe: () => pubsub.asyncIterator([SUBSCRIPTION_ORDER]),
    },
  },
  Query: {
    getActiveOrders: async (_, args, { req }) => {
      console.log("Fetching active orders with arguments:", args);
      try {
        if (!req?.isAuth) {
          console.log("Authentication check failed:", {
            reqExists: !!req,
            authHeader: req?.get?.("Authorization"),
            isAuth: req?.isAuth,
          });
          throw new AuthenticationError("Unauthenticated");
        }

        const filters = {
          orderStatus: { $in: ["PENDING", "ACCEPTED", "PICKED", "ASSIGNED"] },
        };

        if (args.restaurantId) {
          filters.restaurant = args.restaurantId;
        }
        if (args.search) {
          filters.orderId = new RegExp(args.search, "i");
        }
        if (args.actions && args.actions.length > 0) {
          filters.orderStatus = { $in: args.actions };
        }

        const totalCount = await Order.countDocuments(filters);
        const skip = (args.page - 1) * args.rowsPerPage;

        const orders = await Order.find(filters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(args.rowsPerPage)
          .populate("restaurant")
          .populate("deliveryAddress")
          .populate("user")
          .populate("rider")
          .populate("zone")
          .lean();

        return {
          totalCount,
          orders: orders.map((order) => formatOrderDate(order)),
        };
      } catch (err) {
        console.error("Error fetching active orders:", err);
        throw err;
      }
    },
    orderDetails: async (_, args, { req }) => {
      console.log("Fetching order details with arguments:", args);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError("Unauthenticated");
        }
        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order does not exist");
        return transformOrder(order);
      } catch (err) {
        console.error("Error fetching order details:", err);
        throw new Error("Failed to fetch order details");
      }
    },
    ridersByZone: async (_, args, { req }) => {
      console.log("Fetching riders by zone with arguments:", args);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError("Unauthenticated");
        }
        const riders = await Rider.find({
          zone: args.id,
          isActive: true,
          available: true,
        });
        return riders.map(transformRider);
      } catch (err) {
        console.error("Error fetching riders by zone:", err);
        throw new Error("Failed to fetch riders by zone");
      }
    },
  },
  Mutation: {
    updateStatus: async (_, args, { req }) => {
      console.log("Updating status with arguments:", args.id, args.orderStatus);
      try {
        if (!req?.isAuth) {
          throw new AuthenticationError("Unauthenticated");
        }
        const order = await Order.findById(args.id);
        if (!order) {
          throw new UserInputError("Order not found");
        }

        // Check if status is "ASSIGNED" which should only be set via assignRider
        if (args.orderStatus === "ASSIGNED") {
          throw new UserInputError(
            "Cannot directly set status to ASSIGNED. Use assignRider mutation instead."
          );
        }

        // Set the order status
        order.orderStatus = args.orderStatus;

        // Set the appropriate date field based on the status
        const currentDate = new Date();

        switch (args.orderStatus) {
          case "ACCEPTED":
            order.acceptedAt = currentDate;
            break;
          case "PICKED":
            order.pickedAt = currentDate;
            order.isPickedUp = true; // Update the isPickedUp flag
            break;
          case "DELIVERED":
            order.deliveredAt = currentDate;
            order.completionTime = currentDate; // Also update completionTime
            break;
          case "CANCELLED":
            order.cancelledAt = currentDate;
            break;
          default:
            // No specific date field for PENDING status
            break;
        }

        try {
          const result = await order.save();
          // Populate all required fields, especially items and their nested fields
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
          const userId = order.user ? order.user.toString() : null;

          console.log("Publishing ORDER_STATUS_CHANGED event:", {
            userId,
            orderId: transformedOrder._id,
            orderStatus: transformedOrder.orderStatus,
          });

          pubsub.publish(ORDER_STATUS_CHANGED, {
            orderStatusChanged: {
              userId: userId,
              order: transformedOrder,
              origin: "order_status_changed",
            },
          });

          pubsub.publish(SUBSCRIPTION_ORDER, {
            subscriptionOrder: transformedOrder,
          });

          return {
            _id: transformedOrder._id,
            orderStatus: transformedOrder.orderStatus,
            success: true,
          };
        } catch (saveError) {
          console.error("Error saving order:", saveError);
          throw new Error("Failed to save order status update");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        return {
          _id: args.id,
          orderStatus: args.orderStatus,
          success: false,
        };
      }
    },

    assignRider: async (_, args, { req }) => {
      console.log("Assigning rider with arguments:", args.id, args.riderId);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError("Unauthenticated");
        }

        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order not found");

        const rider = await Rider.findById(args.riderId);
        if (!rider) throw new Error("Rider not found");

        if (!rider.available) {
          throw new Error("Rider is not available");
        }

        // Assign the rider to the order
        order.rider = args.riderId;

        // Set the status to ASSIGNED
        order.orderStatus = "ASSIGNED";
        order.assignedAt = new Date();

        try {
          const result = await order.save();

          // Populate all required fields for consistent response formatting
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
          const userId = order.user ? order.user.toString() : null;

          console.log(
            "Publishing ORDER_STATUS_CHANGED event from assignRider:",
            {
              userId,
              orderId: transformedOrder._id,
              orderStatus: transformedOrder.orderStatus,
            }
          );

          pubsub.publish(ORDER_STATUS_CHANGED, {
            orderStatusChanged: {
              userId: userId,
              order: transformedOrder,
              origin: "order_status_changed",
            },
          });

          pubsub.publish(SUBSCRIPTION_ORDER, {
            subscriptionOrder: transformedOrder,
          });

          pubsub.publish(RIDER_ASSIGNED, {
            subscriptionAssignRider: {
              order: transformedOrder,
              origin: "rider_assigned",
            },
          });

          return transformedOrder;
        } catch (saveError) {
          console.error("Error saving order:", saveError);
          throw new Error("Failed to save order status update");
        }
      } catch (error) {
        console.error("Error assigning rider:", error);
        throw error; // Throw the actual error for better debugging
      }
    },
    notifyRiders: async (_, args, { req }) => {
      console.log("Notifying riders with arguments:", args.id);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError("Unauthenticated");
        }
        const order = await Order.findById(args.id);
        if (!order) throw new Error("Order does not exist");

        const transformedOrder = await transformOrder(order);

        publishToZoneRiders(order.zone.toString(), transformedOrder, "new");
        sendNotificationToZoneRiders(order.zone.toString(), transformedOrder);
        publishOrder(transformedOrder);
        sendNotificationToUser(order.user.toString(), transformedOrder);

        return true;
      } catch (err) {
        console.error("Error notifying riders:", err);
        throw new Error("Failed to notify riders");
      }
    },
  },
};
