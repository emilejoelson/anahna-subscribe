import { PubSub } from 'graphql-subscriptions';
import { Request, Response } from 'express';

export interface GraphQLContext {
  pubsub: PubSub;
  req?: Request;
  res?: Response;
  // Add any other context properties here (auth, etc.)
}