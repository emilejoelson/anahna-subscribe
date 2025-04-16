require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws'); // Updated import path
const typeDefs = require('./graphql/schema');
const resolvers = require('./resolvers');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8001;

// Create a PubSub instance for publishing events
const pubsub = new PubSub();

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

async function startApolloServer() {
  // Create Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      pubsub
    }),
  });

  // Start the server
  await server.start();

  // Apply middleware
  server.applyMiddleware({ 
    app,
    path: '/graphql',
    cors: false // We're handling CORS with express middleware
  });

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Set up WebSocket server
  useServer(
    {
      schema: server.schema,
      context: async () => ({
        pubsub
      })
    },
    wsServer
  );

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint available at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`WebSocket server ready at ws://localhost:${PORT}/graphql`);
  });
}

startApolloServer().catch(error => {
  console.error('Failed to start server:', error);
});
