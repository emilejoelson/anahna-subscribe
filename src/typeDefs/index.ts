import { gql } from "apollo-server-express";
import userTypes from "./definitions/user";
import riderTypes from "./definitions/rider";
import configurationTypeDefs from "./definitions/configuration";
import restaurantTypes from "./definitions/restaurant";
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
  riderTypes,
  configurationTypeDefs,
  restaurantTypes,
];
