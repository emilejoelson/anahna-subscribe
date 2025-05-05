require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const schema = require("./schema");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("@apollo/server/plugin/landingPage/default");
const {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  scriptCacheMiddleware,
} = require("./middleware");
const { connectFirebase } = require("./config/firebase");

const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { orderQueue } = require("./queue/index");

require("./workers/orderWorker");

mongoose.set("strictQuery", true);

const app = express();
const httpServer = createServer(app);

app.use(corsMiddleware);
app.use(express.json());
app.use(scriptCacheMiddleware);
app.use(authMiddleware);

let firebaseDb = null;

(async () => {
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

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error:", err);
  }

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const wsServerCleanup = useServer({ schema }, wsServer);

  async function startApolloServer() {
    const server = new ApolloServer({
      schema,
      context: ({ req }) => {
        const redisClient = require("./config/redis").getRedisClient();
        const redisConnected = !!redisClient;
        return {
          mongoConnected: mongoose.connection.readyState === 1,
          firebaseDb,
          redisConnected,
          req,
        };
      },
      formatError: (error) => {
        console.error("GraphQL Error:", {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        });

        if (error.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
          return {
            message: "Invalid query structure",
            code: "VALIDATION_ERROR",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          };
        }

        return {
          message: error.message,
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          locations: error.locations,
          path: error.path,
          ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            details: error.extensions?.exception?.stacktrace,
          }),
        };
      },
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await wsServerCleanup.dispose();
              },
            };
          },
        },
        {
          requestDidStart: async () => ({
            willSendResponse: async (requestContext) => {
              const { response } = requestContext;
              if (response.errors) {
                console.error("GraphQL Response Errors:", response.errors);
              }
            },
          }),
        },
      ],
    });

    await server.start();

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
      queues: [new BullAdapter(orderQueue)],
      serverAdapter,
    });
    app.use("/admin/queues", serverAdapter.getRouter());

    app.use(
      "/graphql",
      cors(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ req }),
      })
    );
  }

  await startApolloServer();

  app.use(errorHandler);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready at ws://localhost:${PORT}/graphql`);
    console.log(
      `GraphQL endpoint available at http://localhost:${PORT}/graphql`
    );
    console.log(`🚀 Bull Board ready at http://localhost:${PORT}/admin/queues`);
  });
})();
