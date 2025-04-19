const jwt = require('jsonwebtoken')
var randomstring = require('randomstring')
const mongoose = require('mongoose')
const Restaurant = require('../models/restaurant')
const Owner = require('../models/owner')
const Offer = require('../models/offer')
const Order = require('../models/order')
const Point = require('../models/point')
const Sections = require('../models/section')
const Zone = require('../models/zone')
const User = require('../models/user')
const {
  sendNotificationToCustomerWeb
} = require('../helpers/firebase-web-notifications')
const {
  transformRestaurant,
  transformOwner,
  transformRestaurants,
  transformOrder,
  transformMinimalRestaurantData,
  transformMinimalRestaurants
} = require('./merge')
const {
  order_status,
  SHOP_TYPE,
  getThirtyDaysAgo
} = require('../helpers/enum')
const {
  publishToZoneRiders,
  publishOrder,
  publishToUser
} = require('../helpers/pubsub')
const { sendNotificationToZoneRiders } = require('../helpers/notifications')
const {
  sendNotificationToUser,
  sendNotificationToRider
} = require('../helpers/notifications')
const bcrypt = require('bcryptjs')

module.exports = {
  Query: {
    restaurants: async () => {
      try {
        const restaurants = await Restaurant.find();
        return restaurants.map(restaurant => transformRestaurant(restaurant));
      } catch (err) {
        throw err;
      }
    },
    restaurant: async (_, { id }) => {
      try {
        const restaurant = await Restaurant.findById(id);
        return transformRestaurant(restaurant);
      } catch (err) {
        throw err;
      }
    },
    restaurantByOwner: async(_, args, { req }) => {
      console.log('restaurantByOwner')
      try {
        const id = args.id || req.userId
        const owner = await Owner.findById(id)
        return transformOwner(owner)
      } catch (e) {
        throw e
      }
    },
    getRestaurantDeliveryZoneInfo: async(_, args, { req }) => {
      console.log('getRestaurantDeliveryZoneInfo')
      try {
        const id = args.id 
        const restaurant = await Restaurant.findById(id)
        return {
          boundType: restaurant.boundType,
          deliveryBounds: restaurant.deliveryBounds,
          location: restaurant.location,
          circleBounds: restaurant.circleBounds,
          address: restaurant.address,
          city: restaurant.city,
          postCode: restaurant.postCode,
        }
      } catch (e) {
        throw e
      }
    },
    restaurants: async _ => {
      console.log('restaurants')
      try {
        const restaurants = await Restaurant.find()
        return transformRestaurants(restaurants)
      } catch (e) {
        throw e
      }
    },
    restaurantsPreview: async _ => {
      console.log('restaurantsPreview')
      try {
        const restaurants = await Restaurant.find()
        return transformMinimalRestaurants(restaurants)
      } catch (e) {
        throw e
      }
    },
    restaurant: async(_, args, { req }) => {
      console.log('restaurant', args)
      try {
        const filters = {}
        if (args.slug) {
          filters.slug = args.slug
        } else if (args.id) {
          filters._id = args.id
        } else if (req.restaurantId) {
          filters._id = req.restaurantId
        } else {
          throw new Error('Invalid request, restaurant id not provided')
        }
        const restaurant = await Restaurant.findOne(filters)
        if (!restaurant) throw Error('Restaurant not found')
        return transformRestaurant(restaurant)
      } catch (e) {
        throw e
      }
    },
    restaurantPreview: async(_, args, { req }) => {
      console.log('restaurantPreview', args)
      try {
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        return {
          boundType: restaurant.deliveryBounds ? 'polygon' : restaurant.circleBounds ? 'circle' : null,
          deliveryBounds: restaurant.deliveryBounds,
          circleBounds: restaurant.circleBounds,
          location: restaurant.location,
          address: restaurant.address,
          city: restaurant.city,
          postCode: restaurant.postCode
        };
      } catch (error) {
        throw new Error(`Could not fetch delivery zone info: ${error.message}`);
      }
    },
    getClonedRestaurants: async () => {
      try {
        const restaurants = await Restaurant.find({ isCloned: true });
        return restaurants.map(restaurant => transformRestaurant(restaurant));
      } catch (error) {
        throw new Error(`Could not fetch cloned restaurants: ${error.message}`);
      }
    }
  },
  Mutation: {
    createRestaurant: async(_, args, { req }) => {
      console.log('createRestanrant', args)
      try {
        // if (!req.userId) throw new Error('Unauthenticated')
        const restaurantExists = await Restaurant.exists({
          name: { $regex: new RegExp('^' + args.restaurant.name + '$', 'i') }
        })
        if (restaurantExists) {
          throw Error('Restaurant by this name already exists')
        }
        const owner = await Owner.findById(args.owner)
        console.log('owner', owner);
        
        if (!owner) throw new Error('Owner does not exist')
        const orderPrefix = randomstring.generate({
          length: 5,
          capitalization: 'uppercase'
        })

        const hashedPassword = await bcrypt.hash(args.restaurant.password, 12)

        const restaurant = new Restaurant({
          name: args.restaurant.name,
          address: args.restaurant.address,
          image: args.restaurant.image,
          logo: args.restaurant.logo,
          orderPrefix: orderPrefix,
          isActive: true,
          deliveryTime: args.restaurant.deliveryTime,
          minimumOrder: args.restaurant.minimumOrder,
          slug: args.restaurant.name.toLowerCase().split(' ').join('-'),
          username: args.restaurant.username,
          password: hashedPassword,
          owner: args.owner,
          tax: args.restaurant.salesTax,
          cuisines: args.restaurant.cuisines ?? [],
          shopType: args.restaurant.shopType || SHOP_TYPE.RESTAURANT, //  default value 'restaurant' for backward compatibility
          // restaurantUrl: args.restaurant.restaurantUrl,
          phone: args.restaurant.phone
        })
        console.log('New Restaurant: ', restaurant)

        const result = await restaurant.save()
        owner.restaurants.push(result.id)
        await owner.save()
        return {
          ...result._doc,
          _id: result.id,
          owner: {
            _id: owner._id,
            email: owner.email,
            isActive: owner.isActive
          },
        }
        // return transformRestaurant(result)
      } catch (err) {
        throw new Error(`Could not create restaurant: ${err.message}`);
      }
    },
    deleteRestaurant: async (_, { id }) => {
      try {
        const restaurant = await Restaurant.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        return { _id: restaurant.id, isActive: restaurant.isActive };
      } catch (err) {
        throw new Error(`Could not delete restaurant: ${err.message}`);
      }
    },
    hardDeleteRestaurant: async (_, { id }) => {
      try {
        const restaurant = await Restaurant.findByIdAndDelete(id);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        await Owner.findByIdAndUpdate(restaurant.owner, { $pull: { restaurants: id } });
        return true;
      } catch (err) {
        throw new Error(`Could not hard delete restaurant: ${err.message}`);
      }
    },
    editRestaurant: async (_, { restaurant: restaurantInput }) => {
      try {
        const restaurant = await Restaurant.findByIdAndUpdate(restaurantInput._id, { ...restaurantInput }, { new: true });
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        return transformRestaurant(restaurant);
      } catch (err) {
        throw new Error(`Could not edit restaurant: ${err.message}`);
      }
    },
    duplicateRestaurant: async (_, { id, owner }) => {
      try {
        const existingRestaurant = await Restaurant.findById(id);
        if (!existingRestaurant) {
          throw new Error('Restaurant not found');
        }
        const restaurantCount = await Restaurant.countDocuments();
        const newRestaurantData = { ...existingRestaurant._doc };
        delete newRestaurantData._id;
        delete newRestaurantData.unique_restaurant_id;
        delete newRestaurantData.orderId;
        delete newRestaurantData.slug;
        newRestaurantData.name = `${newRestaurantData.name} (Clone)`;
        newRestaurantData.username = `${newRestaurantData.username}_clone_${Date.now()}`;
        newRestaurantData.orderId = restaurantCount + 1;
        newRestaurantData.unique_restaurant_id = Math.random().toString(36).substring(2, 15);
        newRestaurantData.slug = newRestaurantData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
        newRestaurantData.owner = owner;
        const newRestaurant = new Restaurant(newRestaurantData);
        const savedRestaurant = await newRestaurant.save();
        await Owner.findByIdAndUpdate(owner, { $push: { restaurants: savedRestaurant._id } });
        return transformRestaurant(savedRestaurant);
      } catch (error) {
        throw new Error(`Could not duplicate restaurant: ${error.message}`);
      }
    },
    updateDeliveryBoundsAndLocation: async (_, { id, boundType, bounds, circleBounds, location, address, postCode, city }) => {
      try {
        const updateData = { location, address, postCode, city };
        if (boundType === 'polygon' && bounds) {
          updateData.deliveryBounds = { coordinates: bounds };
          updateData.circleBounds = null;
        } else if (boundType === 'circle' && circleBounds) {
          updateData.circleBounds = circleBounds;
          updateData.deliveryBounds = null;
          updateData.location = { type: 'Point', coordinates: circleBounds.center };
        } else {
          updateData.deliveryBounds = null;
          updateData.circleBounds = null;
        }
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedRestaurant) {
          return { success: false, message: 'Restaurant not found' };
        }
        return { success: true, message: 'Delivery bounds and location updated successfully', data: { _id: updatedRestaurant._id, deliveryBounds: updatedRestaurant.deliveryBounds, location: updatedRestaurant.location } };
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    orderPickedUp: async(_, args, { req }) => {
      console.log('orderPickedUp')
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order.isPickedUp ? order_status[3] : order_status[2] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(req.restaurantId)
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )

        order[order.isPickedUp ? 'deliveredAt' : 'pickedAt'] = new Date()

        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)

        if (!transformedOrder.isPickedUp) {
          publishToUser(result.rider.toString(), transformedOrder, 'update')
        }
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user.toString(), transformedOrder)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    updateDeliveryBoundsAndLocation: async(_, args) => {
      console.log('updateDeliveryBoundsAndLocation')
      const { id, boundType, bounds: newBounds, circleBounds, location: newLocation, 
              address, postCode, city  } = args
      try {
        const restaurant = await Restaurant.findById(id)
        if (!restaurant) throw new Error('Restaurant does not exists')
        const location = new Point({
          type: 'Point',
          coordinates: [newLocation.longitude, newLocation.latitude]
        })
        console.log('Location: ', location)
        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: location } },
          isActive: true
        })
        console.log('Zone: ', zone)
        if (!zone) {
          return {
            success: false,
            message: "restaurant's location doesn't lie in any delivery zone"
          }
        }
        const updated = await Restaurant.findByIdAndUpdate(
          id,
          {
            deliveryBounds: { type: 'Polygon', coordinates: newBounds },
            circleBounds: { radius: circleBounds.radius },
            location,
            boundType,
            address,
            postCode,
            city,
          },
          { new: true }
        );
        if (!updatedRestaurant) {
          return { success: false, message: 'Restaurant not found' };
        }
        return { success: true, message: 'Restaurant business details updated successfully', data: { _id: updatedRestaurant._id } };
      } catch (error) {
        console.error('Error updating restaurant business details:', error);
        return { success: false, message: `Failed to update: ${error.message}` };
      }
    }
  }
};