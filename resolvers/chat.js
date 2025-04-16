const Order = require('../models/order');
const Message = require('../models/message');
const User = require('../models/user');
const { sendNotification } = require('../helpers/notifications');
const { transformMessage, transformOrder } = require('./merge');
const { withFilter } = require('graphql-subscriptions');
const { pubsub, EVENTS } = require('../helpers/pubsub');

const MessagingResolver = {
  Subscription: {
    subscriptionNewMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.MESSAGE_SENT),
        (payload, { order }, context) => {
          const orderId = payload.subscriptionNewMessage.order;
          return orderId === order;
        }
      )
    }
  },

  Query: {
    chat: async (_, { order: orderID }, { req }) => {
      console.log('Fetching chat for order:', orderID);
      try {
        if (!req.userId) throw new Error('Unauthenticated');
        
        const order = await Order.findById(orderID);
        if (!order) throw new Error('Order not found');
        
        return order.chat.reverse().map(transformMessage);
      } catch (error) {
        console.error('Error fetching chat:', orderID, error);
        throw error;
      }
    }
  },

  Mutation: {
    sendChatMessage: async (_, { message, orderId }, { req }) => {
      console.log('Sending chat message:', message, 'for order:', orderId);
      try {
        if (!req.userId) throw new Error('Unauthenticated');

        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        const messageObj = new Message({ ...message });
        await Order.updateOne(
          { _id: order._id },
          { $push: { chat: messageObj } }
        );

        const transformedOrder = transformOrder(order);

        if (order.user.toString() === req.userId) {
          sendNotification(
            order.rider,
            transformedOrder,
            message.message,
            'chat'
          );
        } else if (order.rider.toString() === req.userId) {
          sendNotification(
            order.user,
            transformedOrder,
            message.message,
            'chat'
          );

          const user = await User.findById(order.user);
          if (user && user.notificationTokenWeb) {
            sendNotification(
              user.notificationTokenWeb,
              'New message: ',
              message.message
            );
          }
        }

        const transformedMessage = transformMessage(messageObj);
        publishNewMessage({ ...transformedMessage, order: order.id });

        return { success: true, data: transformedMessage };
      } catch (error) {
        console.error('Error sending chat message:', error);
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
};

module.exports = MessagingResolver;
