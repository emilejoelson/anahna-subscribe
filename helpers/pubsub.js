const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

// Subscription topics
const PLACE_ORDER = 'PLACE_ORDER';
const ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED';
const ASSIGN_RIDER = 'ASSIGN_RIDER';
const SUBSCRIPTION_ORDER = 'SUBSCRIPTION_ORDER';

const publishToUser = (userId, data, type) => {
  pubsub.publish(ORDER_STATUS_CHANGED, {
    orderStatusChanged: {
      ...data,
      userId,
      type
    }
  });
};

const publishToDashboard = (restaurantId, data, type) => {
  pubsub.publish(PLACE_ORDER, {
    subscribePlaceOrder: {
      ...data,
      restaurantId,
      type
    }
  });
};

const publishOrder = (data) => {
  pubsub.publish(SUBSCRIPTION_ORDER, {
    subscriptionOrder: data
  });
};

const publishToDispatcher = (data) => {
  pubsub.publish(ASSIGN_RIDER, {
    subscriptionAssignRider: data
  });
};

module.exports = {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishOrder,
  publishToDispatcher,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  SUBSCRIPTION_ORDER
};
