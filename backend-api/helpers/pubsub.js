const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const EVENTS = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  ORDER_UPDATED: 'ORDER_UPDATED',
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  ORDER_DISPATCHED: 'ORDER_DISPATCHED'
};

const publishNewMessage = async (message) => {
  await pubsub.publish(EVENTS.MESSAGE_SENT, {
    subscriptionNewMessage: message
  });
};

const publishToDashboard = async (restaurantId, orderData, eventType) => {
  try {
    await pubsub.publish(EVENTS.ORDER_UPDATED, {
      orderUpdated: {
        restaurantId,
        orderData,
        eventType
      }
    });
  } catch (err) {
    console.error("Error publishing to dashboard:", err);
  }
};

const publishToDispatcher = async (orderData) => {
  try {
    await pubsub.publish(EVENTS.ORDER_DISPATCHED, {
      orderDispatched: orderData
    });
  } catch (err) {
    console.error("Error publishing to dispatcher:", err);
  }
};

module.exports = {
  pubsub,
  EVENTS,
  publishNewMessage,
  publishToDashboard,
  publishToDispatcher
};
