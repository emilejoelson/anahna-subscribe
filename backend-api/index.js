require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  scriptCacheMiddleware,
} = require("./middleware");
const { connectFirebase } = require("./config/firebase");
mongoose.set("strictQuery", true);

const app = express();
const httpServer = createServer(app);

app.use(corsMiddleware);
app.use(express.json());
app.use(scriptCacheMiddleware);
app.use(authMiddleware);

let firebaseDb = null;
try {
  firebaseDb = connectFirebase();
  if (!firebaseDb) {
    throw new Error("Failed to connect to Firebase");
  }
} catch (firebaseError) {
  console.error(
    "Critical error: Firebase connection failed, server cannot start:",
    firebaseError
  );
  process.exit(1);
}

const PORT = parseInt(process.env.PORT) || 4000;
const MONGODB_URI =
  process.env.CONNECTION_STRING || "mongodb://localhost:27017/anahna";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const rootValue = require("./resolvers");

if (!schema || !schema.getQueryType) {
  throw new Error(
    "Invalid GraphQL schema: Schema must be a valid GraphQL schema object"
  );
}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: rootValue,
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

useServer(
  {
    schema: executableSchema,
    onConnect: async (ctx) => {
      console.log("Client connected to WebSocket");
      return true;
    },
    onDisconnect: async (ctx) => {
      console.log("Client disconnected from WebSocket");
    },
    onError: (ctx, message, errors) => {
      console.error("GraphQL WebSocket error:", errors);
      return { errors: errors.map((err) => ({ message: err.message })) };
    },
    context: (ctx, msg, args) => {
      return {
        ...ctx,
        isAuth: ctx.connectionParams?.isAuth || false,
        userId: ctx.connectionParams?.userId || null,
      };
    },
  },
  wsServer
);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: executableSchema,
    rootValue: rootValue,
    graphiql: true,
    context: async (req) => ({
      mongoConnected,
      firebaseDb,
      req,
    }),
    customFormatErrorFn: (error) => {
      console.error("GraphQL Error:", error);
      const isSchemaError = error.message.includes("GraphQL schema");
      if (isSchemaError) {
        return {
          message: "Internal server error",
          type: "SCHEMA_ERROR",
          ...(process.env.NODE_ENV === "development" && {
            details: error.message,
          }),
        };
      }
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready at ws://localhost:${PORT}/graphql`);
});
