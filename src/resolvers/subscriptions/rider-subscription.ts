import { IResolvers } from '@graphql-tools/utils';

const resolvers: IResolvers = {
  Subscription: {
    riderUpdated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) => pubsub.asyncIterator(['RIDER_UPDATED'])
    }
  }
};

export default resolvers;