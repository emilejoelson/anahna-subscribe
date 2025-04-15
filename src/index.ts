// src/index.ts
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

// Load environment variables
dotenv.config();

// Create PubSub instance for subscriptions
const pubsub = new PubSub();

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  
  const app: Application = express();
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  // Set up Subscription Server
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe, onConnect: () => ({ pubsub }) },
    { server: httpServer, path: '/graphql' }
  );
  
  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      // You can add authentication logic here
      return {
        pubsub,
        // Add user auth info if needed
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
  
  // Start Apollo Server
  await server.start();
  
  // Apply middleware - using type assertion to avoid version conflicts
  server.applyMiddleware({ app: app as any });
  
  // Start HTTP server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Handle unhandled promise rejections with proper typing
process.on('unhandledRejection', (err: Error | any) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer().catch(err => {
  console.error('Error starting server:', err);
});