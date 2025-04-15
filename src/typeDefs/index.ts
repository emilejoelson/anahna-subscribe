import { gql } from "apollo-server-express";
import userTypes from "./definitions/user";
import configurationTypeDefs from "./definitions/configuration";
import restaurantTypes from "./definitions/restaurant";
import authTypes from "./definitions/auth";
const rootTypeDef = gql`
  type Query {
    _: String
  }

  type Mutation {
    _: String
  }

  type Subscription {
    _: String
  }
`;

export default [
  rootTypeDef,
  userTypes,
  configurationTypeDefs,
  restaurantTypes,
  authTypes,
];
