import { withFilter } from 'graphql-subscriptions';

export default {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(['ORDER_PLACED']),
        (payload, variables) => {
          // Filter to only deliver events for the specific restaurant
          return payload.subscribePlaceOrder.order.restaurant._id.toString() === variables.restaurant;
        }
      )
    },
    
    subscriptionOrder: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(['ORDER_UPDATED']),
        (payload, variables) => {
          // Filter to only deliver events for the specific order
          return payload.subscriptionOrder._id.toString() === variables.id;
        }
      )
    }
  }
};