require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createHandler } = require('graphql-http/lib/use/express');
const typeDefs = require('./graphql');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const rootValue = require('./resolvers');

// Set Mongoose options
mongoose.set('strictQuery', true);

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

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

// Create executable schema
const executableSchema = makeExecutableSchema({
  typeDefs,
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
    },
    onDisconnect: async (ctx) => {
      console.log('Client disconnected from WebSocket');
    },
  },
  wsServer
);

// Set up GraphQL HTTP handler
app.use('/graphql', createHandler({
  schema: executableSchema,
  rootValue: rootValue,
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready at ws://localhost:${PORT}/graphql`);
});