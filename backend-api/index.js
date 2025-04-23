require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  scriptCacheMiddleware
} = require('./middleware');

// Set Mongoose options
mongoose.set('strictQuery', true);

const app = express();
const httpServer = createServer(app);

// Apply middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(scriptCacheMiddleware);
app.use(authMiddleware);

const PORT = parseInt(process.env.PORT) || 4000;
const MONGODB_URI = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/anahna';

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// GraphQL setup
const rootValue = require('./resolvers');

// Validate schema before setting up middleware
if (!schema || !schema.getQueryType) {
  throw new Error('Invalid GraphQL schema: Schema must be a valid GraphQL schema object');
}

// Create executable schema
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: rootValue
});

// WebSocket server setup
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Use the schema with the WebSocket server
useServer(
  {
    schema: executableSchema,
    onConnect: async (ctx) => {
      console.log('Client connected to WebSocket');
      return true; // Explicitly return true to accept the connection
    },
    onDisconnect: async (ctx) => {
      console.log('Client disconnected from WebSocket');
    },
    onError: (ctx, message, errors) => {
      console.error('GraphQL WebSocket error:', errors);
      // Don't expose internal errors to clients
      return { errors: errors.map(err => ({ message: err.message })) };
    },
    context: (ctx, msg, args) => {
      // Pass authentication info from connection params
      return { 
        ...ctx,
        isAuth: ctx.connectionParams?.isAuth || false,
        userId: ctx.connectionParams?.userId || null
      };
    }
  },
  wsServer
);

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP((req, res) => ({
    schema: executableSchema,
    rootValue: rootValue,
    graphiql: true,
    context: {
      req,
      res
    },
    customFormatErrorFn: (error) => {
      console.error('GraphQL Error:', error);
      const isSchemaError = error.message.includes('GraphQL schema');
      if (isSchemaError) {
        return {
          message: 'Internal server error',
          type: 'SCHEMA_ERROR',
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        };
      }
      return {
        message: error.message,
        locations: error.locations,
        path: error.path
      };
    }
  }))
);

// Error handling middleware should be last
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready at ws://localhost:${PORT}/graphql`);
});