// backend/resolvers/restaurant.js
const Restaurant = require('../models/restaurant');
const Owner = require('../models/owner');
const { transformRestaurant } = require('./merge');

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
    restaurantByOwner: async (_, { id }) => {
      try {
        const owner = await Owner.findById(id).populate('restaurants');
        return { ...owner._doc, restaurants: owner.restaurants.map(restaurant => transformRestaurant(restaurant)) };
      } catch (err) {
        throw err;
      }
    },
    getRestaurantDeliveryZoneInfo: async (_, { id }) => {
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
    createRestaurant: async (_, { restaurant, owner }) => {
      try {
        const existingRestaurant = await Restaurant.findOne({ username: restaurant.username });
        if (existingRestaurant) {
          throw new Error('Username is already taken');
        }
        const restaurantCount = await Restaurant.countDocuments();
        const newRestaurant = new Restaurant({
          ...restaurant,
          owner,
          orderId: restaurantCount + 1,
          unique_restaurant_id: Math.random().toString(36).substring(2, 15),
          slug: restaurant.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7)
        });
        const savedRestaurant = await newRestaurant.save();
        await Owner.findByIdAndUpdate(owner, { $push: { restaurants: savedRestaurant._id } });
        return transformRestaurant(savedRestaurant);
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
        console.error('Error updating delivery bounds and location:', error);
        return { success: false, message: `Failed to update: ${error.message}` };
      }
    },
    updateRestaurantDelivery: async (_, { id, minDeliveryFee, deliveryDistance, deliveryFee }) => {
      try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { deliveryInfo: { minDeliveryFee, deliveryDistance, deliveryFee } },
          { new: true }
        );
        if (!updatedRestaurant) {
          return { success: false, message: 'Restaurant not found' };
        }
        return { success: true, message: 'Restaurant delivery info updated successfully', data: { _id: updatedRestaurant._id } };
      } catch (error) {
        console.error('Error updating restaurant delivery info:', error);
        return { success: false, message: `Failed to update: ${error.message}` };
      }
    },
    updateRestaurantBussinessDetails: async (_, { id, bussinessDetails }) => {
      try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { bussinessDetails },
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