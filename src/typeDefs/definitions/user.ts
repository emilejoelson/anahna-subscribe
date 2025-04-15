import { gql } from 'apollo-server-express';

export default gql`
  type Location {
    type: String
    coordinates: [Float!]!
  }

  type Address {
    location: Location
    deliveryAddress: String
  }

  input LocationInput {
    type: String
    coordinates: [Float!]!
  }

  input AddressInput {
    location: LocationInput
    deliveryAddress: String
  }

  type User {
    _id: ID!
    name: String
    email: String!
    phone: String
    isActive: Boolean
    addresses: [Address!]
    createdAt: String!
    updatedAt: String!
  }

  input UserInput {
    name: String!
    email: String!
    phone: String!
    password: String!
    addresses: [AddressInput!]
  }

  input UserUpdateInput {
    _id: ID!
    name: String
    email: String
    phone: String
    isActive: Boolean
    addresses: [AddressInput!]
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(user: UserInput!): User!
    updateUser(user: UserUpdateInput!): User
    deleteUser(id: ID!): User
  }
`;