const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const schema = require('./schema');
require('dotenv').config();

// Set Mongoose options
mongoose.set('strictQuery', true);
mongoose.set('debug', true);

const app = express();

// Add request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Add MongoDB connection status endpoint
app.get('/health', async (req, res) => {
  try {
    const status = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (status === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      res.json({
        status: 'ok',
        mongodb: statusMap[status],
        collections: collections.map(c => c.name)
      });
    } else {
      res.json({
        status: 'error',
        mongodb: statusMap[status]
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// Connect to MongoDB first
async function startServer() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', config.mongodb.uri);
    
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully');
    
    // Test the connection by trying to get collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // GraphQL setup with detailed error logging
    app.use(
      '/graphql',
      graphqlHTTP((request, response, graphQLParams) => {
        return {
          schema: schema,
          graphiql: true,
          context: { req: request, res: response },
          customFormatErrorFn: (err) => {
            const timestamp = new Date().toISOString();
            console.error(`[${timestamp}] GraphQL Error:`, {
              message: err.message,
              locations: err.locations,
              path: err.path,
              stack: err.originalError?.stack,
            });

            // Only send implementation-level errors in development
            return process.env.NODE_ENV === 'development'
              ? {
                  message: err.message,
                  locations: err.locations,
                  path: err.path,
                  stack: err.originalError?.stack,
                }
              : {
                  message: err.message,
                  locations: err.locations,
                  path: err.path,
                };
          }
        };
      })
    );

    // Error handling middleware
    app.use((err, req, res, next) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] Express error:`, err);
      res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    const PORT = process.env.PORT || 8001;
    const server = app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
      console.log(`[${new Date().toISOString()}] GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`[${new Date().toISOString()}] Health check endpoint: http://localhost:${PORT}/health`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed. Closing MongoDB connection...');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed. Process exiting...');
          process.exit(0);
        });
      });
    });

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Server startup error:`, err);
    process.exit(1);
  }
}

mongoose.connection.on('error', err => {
  console.error(`[${new Date().toISOString()}] MongoDB connection error:`, err);
});

mongoose.connection.on('disconnected', () => {
  console.log(`[${new Date().toISOString()}] MongoDB disconnected`);
});

mongoose.connection.on('connected', () => {
  console.log(`[${new Date().toISOString()}] MongoDB connected`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled Rejection at:`, promise, 'reason:', reason);
});

startServer();