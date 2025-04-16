import { gql } from 'apollo-server-express';

export default gql`
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type Query {
     refreshToken(refreshToken: String!): AuthPayload
  }

 extend type Mutation {
  signup(user: UserInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  logout(accessToken: String!): Boolean!
  refreshToken(refreshToken: String!): AuthPayload
}
`;