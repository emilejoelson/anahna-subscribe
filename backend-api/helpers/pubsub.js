const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const EVENTS = {
  MESSAGE_SENT: "MESSAGE_SENT",
  ORDER_UPDATED: "ORDER_UPDATED",
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  ORDER_DISPATCHED: "ORDER_DISPATCHED",
  ASSIGN_RIDER: "ASSIGN_RIDER",
  SUBSCRIPTION_ORDER: "SUBSCRIPTION_ORDER",
};

const publishNewMessage = async (message) => {
  await pubsub.publish(EVENTS.MESSAGE_SENT, {
    subscriptionNewMessage: message,
  });
};

const publishToDashboard = async (restaurantId, orderData, eventType) => {
  try {
    await pubsub.publish(EVENTS.ORDER_UPDATED, {
      orderUpdated: {
        restaurantId,
        orderData,
        eventType,
      },
    });
  } catch (err) {
    console.error("Error publishing to dashboard:", err);
  }
};

const publishToDispatcher = async (orderData) => {
  try {
    await pubsub.publish(EVENTS.ORDER_DISPATCHED, {
      orderDispatched: orderData,
    });
  } catch (err) {
    console.error("Error publishing to dispatcher:", err);
  }
};

const publishToAssignedRider = async (riderId, orderData, action) => {
  try {
    await pubsub.publish(EVENTS.ASSIGN_RIDER, {
      subscriptionAssignRider: {
        userId: riderId,
        order: orderData,
        origin: action,
      },
    });
  } catch (err) {
    console.error("Error publishing to assigned rider:", err);
  }
};

const publishOrder = async (orderData) => {
  try {
    await pubsub.publish(EVENTS.SUBSCRIPTION_ORDER, {
      subscriptionOrder: orderData,
    });
  } catch (err) {
    console.error("Error publishing order update:", err);
  }
};

const publishToZoneRiders = async (zoneId, orderData, action) => {
  try {
    await pubsub.publish(EVENTS.ORDER_DISPATCHED, {
      subscriptionZoneOrders: {
        zoneId,
        order: orderData,
        origin: action,
      },
    });
  } catch (err) {
    console.error("Error publishing to zone riders:", err);
  }
};

module.exports = {
  pubsub,
  EVENTS,
  publishNewMessage,
  publishToDashboard,
  publishToDispatcher,
  publishToAssignedRider,
  publishOrder,
  publishToZoneRiders,
  ASSIGN_RIDER: EVENTS.ASSIGN_RIDER,
  SUBSCRIPTION_ORDER: EVENTS.SUBSCRIPTION_ORDER,
  DISPATCH_ORDER: EVENTS.ORDER_DISPATCHED,
};
