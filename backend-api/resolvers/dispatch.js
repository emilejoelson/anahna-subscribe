/* eslint-disable no-tabs */
const { AuthenticationError } = require('apollo-server-express');
const Order = require('../models/order');
const Rider = require('../models/rider');
const Restaurant = require('../models/restaurant');
const {
  pubsub,
  DISPATCH_ORDER,
  publishOrder,
  publishToAssignedRider,
  publishToZoneRiders,
  publishToUser
} = require('../helpers/pubsub');
const { transformOrder, transformRider } = require('./merge');
const {
  sendNotificationToUser,
  sendNotificationToZoneRiders,
  sendNotificationToRider
} = require('../helpers/notifications');
const { order_status } = require('../helpers/enum');
const { formatOrderDate } = require('../helpers/date');

module.exports = {
  Subscription: {
    subscriptionDispatcher: {
      subscribe: () => pubsub.asyncIterator(DISPATCH_ORDER)
    }
  },
  Query: {
    getActiveOrders: async (_, args, { req }) => {
      console.log('Fetching active orders with arguments:', args);
      try {
        if (!req?.isAuth) {
          console.log('Authentication check failed:', { 
            reqExists: !!req,
            authHeader: req?.get?.('Authorization'),
            isAuth: req?.isAuth
          });
          throw new AuthenticationError('Unauthenticated');
        }

        const filters = {
          orderStatus: { $in: ['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'] }
        };

        if (args.restaurantId) {
          filters.restaurant = args.restaurantId;
        }
        if (args.search) {
          filters.orderId = new RegExp(args.search, 'i');
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
          .populate('restaurant')
          .populate('deliveryAddress')
          .populate('user')
          .populate('rider')
          .populate('zone')
          .lean();

        return {
          totalCount,
          orders: orders.map(order => formatOrderDate(order))
        };
      } catch (err) {
        console.error('Error fetching active orders:', err);
        throw err;
      }
    },
    orderDetails: async (_, args, { req }) => {
      console.log('Fetching order details with arguments:', args);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated');
        }
        const order = await Order.findById(args.id);
        if (!order) throw new Error('Order does not exist');
        return transformOrder(order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        throw new Error('Failed to fetch order details');
      }
    },
    ridersByZone: async (_, args, { req }) => {
      console.log('Fetching riders by zone with arguments:', args);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated');
        }
        const riders = await Rider.find({
          zone: args.id,
          isActive: true,
          available: true
        });
        return riders.map(transformRider);
      } catch (err) {
        console.error('Error fetching riders by zone:', err);
        throw new Error('Failed to fetch riders by zone');
      }
    }
  },
  Mutation: {
    updateStatus: async (_, args, { req }) => {
      console.log('Updating status with arguments:', args.id, args.orderStatus);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated');
        }
        const order = await Order.findById(args.id);
        if (!order) throw new Error('Order not found');
        
        const restaurant = await Restaurant.findById(order.restaurant);
        if (!restaurant) throw new Error('Restaurant not found');

        if (args.orderStatus === 'ACCEPTED') {
          order.completionTime = new Date(Date.now() + restaurant.deliveryTime * 60 * 1000);
          order.acceptedAt = new Date();
        }
        if (args.orderStatus === 'PICKED') {
          order.completionTime = new Date(Date.now() + 15 * 60 * 1000);
          order.pickedAt = new Date();
        }
        if (args.orderStatus === 'CANCELLED') {
          order.cancelledAt = new Date();
        }
        if (args.orderStatus === 'DELIVERED') {
          order.deliveredAt = new Date();
        }
        
        order.orderStatus = args.orderStatus;
        const result = await order.save();

        sendNotificationToUser(result.user, result);
        const transformedOrder = await transformOrder(result);
        publishOrder(transformedOrder);
        publishToUser(result.user.toString(), transformedOrder, 'update');

        if (!order.isPickedUp) {
          if (args.orderStatus === 'ACCEPTED' && order.rider) {
            publishToAssignedRider(order.rider.toString(), transformedOrder, 'new');
            sendNotificationToRider(result.rider.toString(), transformedOrder);
          }
          if (args.orderStatus === 'ACCEPTED' && !order.rider) {
            publishToZoneRiders(order.zone.toString(), transformedOrder, 'new');
            sendNotificationToZoneRiders(order.zone.toString(), transformedOrder);
          }
          if (args.orderStatus === 'CANCELLED' && order.rider) {
            publishToAssignedRider(order.rider.toString(), transformedOrder, 'remove');
            sendNotificationToRider(result.rider.toString(), transformedOrder);
          }
        }

        return transformedOrder;
      } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
      }
    },

    assignRider: async (_, args, { req }) => {
      console.log('Assigning rider with arguments:', args.id, args.riderId);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated');
        }

        // Find and validate order and rider
        const order = await Order.findById(args.id);
        if (!order) throw new Error('Order not found');

        const rider = await Rider.findById(args.riderId);
        if (!rider) throw new Error('Rider not found');

        // Check if rider is available
        if (!rider.available) {
          throw new Error('Rider is not available');
        }

        // If order already has a rider, notify them about removal
        const currentTransformedOrder = await transformOrder(order);
        if (order.rider) {
          publishToAssignedRider(order.rider.toString(), currentTransformedOrder, 'remove');
          sendNotificationToRider(order.rider.toString(), currentTransformedOrder);
        }

        // Update order with new rider and status
        order.rider = args.riderId;
        order.orderStatus = 'ASSIGNED';
        order.assignedAt = new Date();

        // Save changes
        const result = await order.save();
        const transformedOrder = await transformOrder(result);

        // Notify relevant parties
        publishToAssignedRider(args.riderId, transformedOrder, 'new');
        sendNotificationToRider(args.riderId, transformedOrder);
        publishOrder(transformedOrder);
        sendNotificationToUser(order.user.toString(), transformedOrder);

        return transformedOrder;
      } catch (error) {
        console.error('Error assigning rider:', error);
        throw error; // Throw the actual error for better debugging
      }
    },

    notifyRiders: async (_, args, { req }) => {
      console.log('Notifying riders with arguments:', args.id);
      try {
        if (!req.isAuth) {
          throw new AuthenticationError('Unauthenticated');
        }
        const order = await Order.findById(args.id);
        if (!order) throw new Error('Order does not exist');

        const transformedOrder = await transformOrder(order);

        publishToZoneRiders(order.zone.toString(), transformedOrder, 'new');
        sendNotificationToZoneRiders(order.zone.toString(), transformedOrder);
        publishOrder(transformedOrder);
        sendNotificationToUser(order.user.toString(), transformedOrder);

        return true;
      } catch (err) {
        console.error('Error notifying riders:', err);
        throw new Error('Failed to notify riders');
      }
    }
    // remove rider
  }
};
