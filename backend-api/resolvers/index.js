const auth = require('./auth');
const restaurant = require('./restaurant');
const user = require('./user');
const vendor = require('./vendor');
const category = require('./category');
const cuisine = require('./cuisine');
const food = require('./food');
const order = require('./order');
const rider = require('./rider');
const review = require('./review');
const configuration = require('./configuration');
const offer = require('./offer');
const section = require('./section');
const zone = require('./zone');
const earnings = require('./earnings');
const banner = require('./banner');
const withdrawRequest = require('./withdrawRequest');

module.exports = {
  Query: {
    ...restaurant.Query,
    ...user.Query,
    ...vendor.Query,
    ...category.Query,
    ...cuisine.Query,
    ...food.Query,
    ...order.Query,
    ...rider.Query,
    ...review.Query,
    ...configuration.Query,
    ...offer.Query,
    ...section.Query,
    ...zone.Query,
    ...earnings.Query,
    ...banner.Query,
    ...withdrawRequest.Query,
  },
  Mutation: {
    ...auth.Mutation,
    ...restaurant.Mutation,
    ...user.Mutation,
    ...vendor.Mutation,
    ...category.Mutation,
    ...cuisine.Mutation,
    ...food.Mutation,
    ...order.Mutation,
    ...rider.Mutation,
    ...review.Mutation,
    ...configuration.Mutation,
    ...offer.Mutation,
    ...section.Mutation,
    ...zone.Mutation,
    ...earnings.Mutation,
    ...banner.Mutation,
    ...withdrawRequest.Mutation,
  },
  Subscription: {
    ...order.Subscription,
    ...rider.Subscription,
  }
};
