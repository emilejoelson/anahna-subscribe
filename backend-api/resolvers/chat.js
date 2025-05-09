const Order = require("../models/order");
const Message = require("../models/message");
const User = require("../models/user");
const { sendNotification } = require("../helpers/notifications");
const { transformMessage, transformOrder } = require("./merge");
const { withFilter } = require("graphql-subscriptions");
const { EVENTS } = require("../helpers/pubsub");
const { pubsub } = require("../config/pubsub");
const { MESSAGE_SENT } = require("../constants/subscriptionEvents");

const MessagingResolver = {
  Subscription: {
    subscriptionNewMessage: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_SENT]),
    },
  },
  Query: {
    chat: async (_, { order: orderId }, { req }) => {
      try {
        if (!req.userId) throw new Error("Unauthenticated");
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");
        const messages = await Message.find({ order: orderId }).sort({
          createdAt: -1,
        });
        return messages.map((message) => transformMessage(message));
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    sendChatMessage: async (_, { message: messageInput, orderId }, { req }) => {
      try {
        if (!req.userId) throw new Error("Unauthenticated");
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        const messageObj = new Message({
          message: messageInput.message,
          user: {
            id: messageInput.user.id,
            name: messageInput.user.name,
            model: "Customer",
          },
          order: orderId,
          createdAt: new Date(),
        });

        const savedMessage = await messageObj.save();

        await Order.updateOne(
          { _id: order._id },
          { $push: { chat: savedMessage._id } }
        );

        const transformedMessage = transformMessage(savedMessage);

        const updatedMessages = await Message.find({ order: orderId }).sort({
          createdAt: -1,
        });

        const transformedMessages = updatedMessages.map((msg) =>
          transformMessage(msg)
        );

        pubsub.publish(MESSAGE_SENT, {
          subscriptionNewMessage: {
            ...transformedMessage,
            allMessages: transformedMessages,
          },
        });

        return {
          success: true,
          message: "Message sent successfully",
          data: transformedMessage,
          allMessages: transformedMessages,
        };
      } catch (error) {
        console.error("Error sending chat message:", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};

module.exports = MessagingResolver;
