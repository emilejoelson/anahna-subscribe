const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const EVENTS = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  ORDER_UPDATED: 'ORDER_UPDATED',
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED'
};

const publishNewMessage = async (message) => {
  await pubsub.publish(EVENTS.MESSAGE_SENT, {
    subscriptionNewMessage: message
  });
};

module.exports = {
  pubsub,
  EVENTS,
  publishNewMessage
};
