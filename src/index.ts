import express from 'express';
import { Application } from 'express-serve-static-core';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import typeDefs from './typeDefs';
import resolvers from './resolvers';
import connectDB from './config/db';

dotenv.config();

const pubsub = new PubSub();

async function startServer() {
  await connectDB();
  
  const app: Application = express();
  
  const httpServer = createServer(app);
  
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe, onConnect: () => ({ pubsub }) },
    { server: httpServer, path: '/graphql' }
  );
  
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return {
        req,
        pubsub
      };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          };
        }
      }
    ]
  });
  
  await server.start();
  
  server.applyMiddleware({ app: app as any });
  
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

process.on('unhandledRejection', (err: Error | any) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

startServer().catch(err => {
  console.error('Error starting server:', err);
});