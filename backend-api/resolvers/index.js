const authResolver = require('./auth')
const foodResolver = require('./food')
const orderResolver = require('./order')
const categoryResolver = require('./category')
const configurationResolver = require('./configuration')
const riderResolver = require('./rider')
const optionResolver = require('./option')
const addonResolver = require('./addon')
const couponResolver = require('./coupon')
const dashboardResolver = require('./dashboard')
const restaurantResolver = require('./restaurant')
const reviewResolver = require('./review')
const offerResolver = require('./offer')
const zoneResolver = require('./zone')
const addressResolver = require('./address')
const userResolver = require('./user')
const vendorResolver = require('./vendor')
const dispatchResolver = require('./dispatch')
const taxationResolver = require('./taxation')
const tippingResolver = require('./tipping')
const sectionResolver = require('./section')
const notificationMutation = require('./notification')
const earningsResolver = require('./earnings')
const withdrawRequestResolver = require('./withdrawRequest')
const chatResolver = require('./chat')
const countries = require('./countries')
const cuisine = require('./cuisine')
const banner = require('./banner')
const demo = require('./demo')
const staff = require('./staff')

// Make sure to import the Option model
const Option = require('../models/option');
const Restaurant = require('../models/restaurant');

const restaurantResolvers = {
  Restaurant: {
    options: async (parent) => {
      try {
        console.log(`Restaurant options resolver for ID: ${parent._id}`);
        
        // Make sure we have the full restaurant document with options
        const restaurant = await Restaurant.findById(parent._id);
        if (!restaurant || !restaurant.options || restaurant.options.length === 0) {
          console.log(`No options found in restaurant ${parent._id}`);
          return [];
        }
        
        console.log(`Found ${restaurant.options.length} options in restaurant ${parent._id}`);
        
        // Format options for GraphQL
        return restaurant.options.map(option => ({
          _id: option._id.toString(),
          title: option.title,
          description: option.description || "",
          price: option.price,
          restaurant: restaurant._id.toString(),
          isActive: option.isActive !== undefined ? option.isActive : true,
          options: [{
            _id: option._id.toString(),
            title: option.title,
            description: option.description || "",
            price: option.price
          }]
        }));
      } catch (error) {
        console.error(`Error in Restaurant.options resolver: ${error.message}`);
        return [];
      }
    }
  }
};

const rootResolver = {
  Query: {
    ...dashboardResolver.Query,
    ...orderResolver.Query,
    ...configurationResolver.Query,
    ...riderResolver.Query,
    ...optionResolver.Query,
    ...addonResolver.Query,
    ...couponResolver.Query,
    ...restaurantResolver.Query,
    ...reviewResolver.Query,
    ...offerResolver.Query,
    ...zoneResolver.Query,
    ...userResolver.Query,
    ...vendorResolver.Query,
    ...dispatchResolver.Query,
    ...tippingResolver.Query,
    ...taxationResolver.Query,
    ...sectionResolver.Query,
    ...withdrawRequestResolver.Query,
    ...earningsResolver.Query,
    ...chatResolver.Query,
    ...countries.Query,
    ...cuisine.Query,
    ...banner.Query,
    ...demo.Query,
    ...categoryResolver.Query,
    ...staff.Query
  },
  Mutation: {
    ...dashboardResolver.Mutation,
    ...authResolver.Mutation,
    ...foodResolver.Mutation,
    ...orderResolver.Mutation,
    ...categoryResolver.Mutation,
    ...configurationResolver.Mutation,
    ...riderResolver.Mutation,
    ...optionResolver.Mutation,
    ...addonResolver.Mutation,
    ...couponResolver.Mutation,
    ...restaurantResolver.Mutation,
    ...reviewResolver.Mutation,
    ...offerResolver.Mutation,
    ...zoneResolver.Mutation,
    ...addressResolver.Mutation,
    ...userResolver.Mutation,
    ...vendorResolver.Mutation,
    ...dispatchResolver.Mutation,
    ...tippingResolver.Mutation,
    ...taxationResolver.Mutation,
    ...sectionResolver.Mutation,
    ...notificationMutation.Mutation,
    ...withdrawRequestResolver.Mutation,
    ...earningsResolver.Mutation,
    ...chatResolver.Mutation,
    ...cuisine.Mutation,
    ...banner.Mutation,
    ...demo.Mutation,
    ...staff.Mutation
  },
  Subscription: {
    ...orderResolver.Subscription,
    ...riderResolver.Subscription,
    ...dispatchResolver.Subscription,
    ...chatResolver.Subscription
  },
  ...restaurantResolvers
}

module.exports = rootResolver
