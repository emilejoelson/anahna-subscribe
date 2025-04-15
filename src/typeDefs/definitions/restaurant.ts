import { gql } from 'apollo-server-express';

export default gql`
  type User {
    _id: ID!
    email: String!
    isActive: Boolean
  }

  type Coordinates {
    coordinates: [Float!]!
  }

  input CoordinatesInput {
    coordinates: [Float!]!
  }

  input CircleBoundsInput {
    center: [Float!]!
    radius: Float!
  }

  type CircleBounds {
    center: [Float!]!
    radius: Float!
  }

  type DeliveryBounds {
    type: String
    coordinates: [[[Float!]!]!]
    circle: CircleBounds
  }

  input BussinessDetailsInput {
    vatNumber: String
    registrationNumber: String
  }

  input OpeningTimeInput {
    day: String!
    times: [TimeRangeInput!]!
  }

  input TimeRangeInput {
    startTime: String!
    endTime: String!
  }

  type Location {
    type: String
    coordinates: [Float!]!
  }

  type Restaurant {
    _id: ID!
    name: String!
    image: String
    username: String!
    orderPrefix: String
    slug: String
    phone: String
    address: String
    deliveryTime: String
    minimumOrder: Float
    isActive: Boolean
    commissionRate: Float
    tax: Float
    shopType: String
    orderId: Int
    logo: String
    location: Location! # Use the defined Location output type
    cuisines: [String!]
    owner: User
    isAvailable: Boolean
    openingTimes: [OpeningTime!]
    deliveryBounds: DeliveryBounds
    bussinessDetails: BussinessDetails
    minDeliveryFee: Float
    deliveryDistance: Float
    deliveryFee: Float
    createdAt: String!
    updatedAt: String!
  }

  type OpeningTime {
    day: String!
    times: [TimeRange!]!
  }

  type TimeRange {
    startTime: String!
    endTime: String!
  }

  type BussinessDetails {
    vatNumber: String
    registrationNumber: String
  }

  input RestaurantInput {
    name: String!
    image: String
    username: String!
    orderPrefix: String
    slug: String
    phone: String
    address: String
    deliveryTime: String
    minimumOrder: Float
    isActive: Boolean
    commissionRate: Float
    tax: Float
    shopType: String
    orderId: Int
    logo: String
    password: String!
    location: CoordinatesInput! # Input uses CoordinatesInput
    cuisines: [String!]
  }

  input RestaurantProfileInput {
    _id: ID!
    orderId: Int
    orderPrefix: String
    name: String
    phone: String
    image: String
    logo: String
    slug: String
    address: String
    username: String
    password: String
    location: CoordinatesInput # Input uses CoordinatesInput
    isAvailable: Boolean
    minimumOrder: Float
    tax: Float
    openingTimes: [OpeningTimeInput!]
    shopType: String
  }

  type UpdateDeliveryBoundsAndLocationResult {
    success: Boolean!
    message: String
    data: Restaurant
  }

  type UpdateRestaurantDeliveryResult {
    success: Boolean!
    message: String
    data: Restaurant
  }

  type UpdateRestaurantBussinessDetailsResult {
    success: Boolean!
    message: String
    data: Restaurant
  }

  extend type Mutation {
    createRestaurant(restaurant: RestaurantInput!, owner: ID!): Restaurant!
    deleteRestaurant(id: String!): Restaurant
    hardDeleteRestaurant(id: String!): Boolean!
    updateDeliveryBoundsAndLocation(
      id: ID!
      boundType: String!
      bounds: [[[Float!]]]
      circleBounds: CircleBoundsInput
      location: CoordinatesInput!
      address: String
      postCode: String
      city: String
    ): UpdateDeliveryBoundsAndLocationResult!
    editRestaurant(restaurant: RestaurantProfileInput!): Restaurant
    duplicateRestaurant(id: String!, owner: String!): Restaurant!
    updateFoodOutOfStock(id: String!, restaurant: String!, categoryId: String!): Boolean!
    updateRestaurantDelivery(
      id: ID!
      minDeliveryFee: Float
      deliveryDistance: Float
      deliveryFee: Float
    ): UpdateRestaurantDeliveryResult!
    updateRestaurantBussinessDetails(
      id: String!
      bussinessDetails: BussinessDetailsInput
    ): UpdateRestaurantBussinessDetailsResult!
  }

  extend type Query {
    restaurant(id: String): Restaurant,
    getAllRestaurants: [Restaurant]
  }
`;