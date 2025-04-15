import { gql } from 'apollo-server-express';

export default gql`
  type Rider {
    _id: ID
    name: String
    username: String
    available: Boolean
    location: Location
    isActive: Boolean
    createdAt: String
  }
  
  type RiderUpdatePayload {
    _id: ID
  }
  
  extend type Query {
    getRiders: [Rider]
    getRider(id: String!): Rider
  }
  
  extend type Subscription {
    riderUpdated: RiderUpdatePayload
  }
`;