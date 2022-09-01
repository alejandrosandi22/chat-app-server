import express from 'express';
import { createServer } from 'http';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { useServer } from 'graphql-ws/lib/use/ws';
import schema from './schema';
import { ApolloServer } from 'apollo-server-express';
import { context } from './context';
import { WebSocketServer } from 'ws';
import 'dotenv/config';

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: 'bounded',
  context,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

server.start().then(() => {
  server.applyMiddleware({ app });
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );

    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql'`);
  });
});
