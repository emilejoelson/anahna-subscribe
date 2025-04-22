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
const Option = require('../models/option')
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
    restaurant: async(_, args, { req }) => {
      console.log('restaurant query called with args:', args)
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
        console.log('Finding restaurant with filters:', filters)
        const restaurant = await Restaurant.findOne(filters).lean()
        if (!restaurant) {
          console.log('Restaurant not found with filters:', filters)
          throw Error('Restaurant not found')
        }
        console.log(`Found restaurant: ${restaurant.name}, has ${restaurant.addons?.length || 0} addons`)
        return transformRestaurant(restaurant)
      } catch (e) {
        console.error('Error in restaurant query:', e)
        throw e
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
    restaurantPreview: async(_, args, { req }) => {
      console.log('restaurantPreview', args)
      try {
        const restaurant = await Restaurant.findById(args.id);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        return {
          _id: restaurant._id.toString(),
          boundType: restaurant.deliveryBounds ? 'polygon' : restaurant.circleBounds ? 'circle' : null,
          deliveryBounds: restaurant.deliveryBounds,
          circleBounds: restaurant.circleBounds,
          location: restaurant.location,
          address: restaurant.address,
          city: restaurant.city,
          postCode: restaurant.postCode
        };
      } catch (error) {
        console.error('Error in restaurantPreview:', error);
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
    },
    subCategories: async (_, { categoryId }) => {
      try {
        const restaurant = await Restaurant.findOne({ 'categories._id': categoryId });
        if (!restaurant) {
          return [];
        }
        
        const category = restaurant.categories.find(cat => cat._id.toString() === categoryId);
        if (!category || !category.subCategories) {
          return [];
        }
        
        return category.subCategories.map(sub => ({
          _id: sub._id.toString(),
          title: sub.title || '',
          description: sub.description || '',
          isActive: sub.isActive !== undefined ? sub.isActive : true,
          parentCategoryId: categoryId
        }));
      } catch (error) {
        console.error('Error fetching subCategories:', error);
        return [];
      }
    },
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
        const restaurant = await Restaurant.findByIdAndUpdate(id, 
          // { isActive: false }, 
          { new: true });
        // update status
        if (restaurant.isActive) {
          restaurant.isActive = false
        } else {
          restaurant.isActive = true
        }
        await restaurant.save()
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
        log('editRestaurant', restaurantInput)
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
        const updateData = { boundType, location, address, postCode, city };
        if (boundType === 'polygon' && bounds) {
          updateData.deliveryBounds = { coordinates: bounds };
          updateData.circleBounds = null;
          updateData.boundType = 'polygon';
        } else if (boundType === 'circle' && circleBounds) {
          updateData.circleBounds = circleBounds;
          updateData.deliveryBounds = null;
          updateData.location = { type: 'Point', coordinates: circleBounds.center };
          updateData.boundType = 'circle';
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
    updateTimings: async (_, { id, openingTimes }, { models }) => {
      try {
        if (!openingTimes || openingTimes.length === 0) {
          throw new Error('openingTimes required');
        }
    
        const cleanedOpeningTimes = openingTimes.map(timing => ({
          day: timing.day,
          times: timing.times.map(time => ({
            startTime: Array.isArray(time.startTime) ? time.startTime : [],
            endTime: Array.isArray(time.endTime) ? time.endTime : []
          }))
        }));
    
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { $set: { openingTimes: cleanedOpeningTimes } },
          { new: true }
        );
    
        if (!updatedRestaurant) {
          throw new Error('Restaurant not found');
        }
    
        return {
          _id: updatedRestaurant._id.toString(),
          openingTimes: updatedRestaurant.openingTimes
        };
    
      } catch (error) {
        console.error('Error in updateTimings:', error);
        throw new Error(`Update Timing Error: ${error.message}`);
      }
    }
  },
  Restaurant: {
    options: async (parent) => {
      // If parent (restaurant) doesn't have options or they're empty, return empty array
      if (!parent.options || parent.options.length === 0) {
        console.log(`No options found for restaurant ${parent._id}`);
        return [];
      }
      
      console.log(`Found ${parent.options.length} options for restaurant ${parent._id}`);
      
      // Format options for return
      return parent.options.map(option => ({
        _id: option._id || new mongoose.Types.ObjectId(),
        title: option.title,
        description: option.description || "",
        price: option.price,
        restaurant: parent._id,
        isActive: option.isActive !== undefined ? option.isActive : true,
        options: [{
          _id: option._id || new mongoose.Types.ObjectId(),
          title: option.title,
          description: option.description || "",
          price: option.price
        }]
      }));
    },
    addons: async (parent) => {
      console.log(`===== ADDON DEBUG START =====`);
      console.log(`Processing addons for restaurant: ${parent.name || parent._id}`);
      
      // If parent (restaurant) doesn't have addons or they're empty, return empty array
      if (!parent.addons || parent.addons.length === 0) {
        console.log(`No addons found for restaurant ${parent._id}`);
        return [];
      }
      
      console.log(`Found ${parent.addons.length} addons in restaurant document`);
      
      try {
        // Filter out null or invalid addons first
        const validAddons = parent.addons.filter(addon => addon !== null && addon !== undefined);
        
        // Format each addon with error handling
        const formattedAddons = validAddons.map((addon, index) => {
          try {
            // Handle reference addons (strings or ObjectIds)
            if (typeof addon === 'string' || addon instanceof mongoose.Types.ObjectId) {
              const addonId = typeof addon === 'string' ? addon : addon._id.toString();
              console.log(`Processing reference addon ${index} with ID: ${addonId}`);
              return {
                _id: addonId,
                title: "Loading...", // Placeholder title
                description: "",
                options: [],
                quantityMinimum: 0,
                quantityMaximum: 1,
                isActive: true
              };
            }
            
            // Handle addon objects
            console.log(`Processing addon ${index}`);
            return {
              _id: addon._id ? addon._id.toString() : new mongoose.Types.ObjectId().toString(),
              // IMPORTANT: Ensure title is never null
              title: addon.title || "Unnamed Addon",
              description: addon.description || "",
              options: Array.isArray(addon.options) ? addon.options.map(opt => 
                typeof opt === 'object' && opt._id ? opt._id.toString() : opt.toString()
              ) : [],
              quantityMinimum: addon.quantityMinimum !== undefined ? addon.quantityMinimum : 0,
              quantityMaximum: addon.quantityMaximum !== undefined ? addon.quantityMaximum : 1,
              isActive: addon.isActive !== undefined ? addon.isActive : true
            };
          } catch (error) {
            console.error(`Error processing addon ${index}:`, error);
            // Return a valid fallback addon
            return {
              _id: new mongoose.Types.ObjectId().toString(),
              title: "Error Addon",
              description: "Error processing addon data",
              options: [],
              quantityMinimum: 0,
              quantityMaximum: 1,
              isActive: false
            };
          }
        });
        
        console.log(`Returning ${formattedAddons.length} formatted addons`);
        console.log(`===== ADDON DEBUG END =====`);
        return formattedAddons;
      } catch (error) {
        console.error(`Error formatting addons for restaurant ${parent._id}:`, error);
        console.log(`===== ADDON DEBUG END WITH ERROR =====`);
        // Return empty array instead of throwing
        return [];
      }
    },
    categories: async (parent) => {
      try {
        if (!parent.categories || parent.categories.length === 0) {
          console.log(`No categories found for restaurant ${parent._id}`);
          return [];
        }
        
        console.log(`Found ${parent.categories.length} categories for restaurant ${parent._id}`);
        let totalFoods = 0;
        
        const formattedCategories = parent.categories.map(category => {
          // Process foods directly from embedded documents
          const foodItems = (category.foods || []).map(food => {
            totalFoods++;
            // Ensure food properties are never null/undefined
            return {
              _id: food._id ? food._id.toString() : new mongoose.Types.ObjectId().toString(),
              title: food.title || 'Unnamed Food',
              description: food.description || '',
              image: food.image || '',
              isActive: food.isActive !== undefined ? food.isActive : true,
              isOutOfStock: food.isOutOfStock !== undefined ? food.isOutOfStock : false,
              subCategory: food.subCategory || '',
              variations: (food.variations || []).map(variation => {
                // Generate a new _id if missing
                const variationId = variation._id || new mongoose.Types.ObjectId();
                return {
                  _id: variationId.toString(), // Ensure it's a string
                  title: variation.title || 'Default Variation', 
                  price: variation.price || 0,
                  discounted: variation.discounted || null,
                  addons: variation.addons || [],
                  isOutOfStock: variation.isOutOfStock !== undefined ? variation.isOutOfStock : false
                };
              }),
              createdAt: food.createdAt ? new Date(food.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: food.updatedAt ? new Date(food.updatedAt).toISOString() : new Date().toISOString()
            };
          });
          
          console.log(`Category ${category.title || "Unnamed"} has ${foodItems.length} foods`);
          
          // Format the category
          return {
            _id: category._id.toString(),
            title: category.title || 'Unnamed Category',
            description: category.description || '',
            image: category.image || '',
            isActive: category.isActive !== undefined ? category.isActive : true,
            foods: foodItems,
            // Explicitly set an empty array if no subCategories exist
            subCategories: (category.subCategories || []).map(subCategory => ({
              _id: subCategory._id ? subCategory._id.toString() : new mongoose.Types.ObjectId().toString(),
              title: subCategory.title || '',
              description: subCategory.description || '',
              isActive: subCategory.isActive !== undefined ? subCategory.isActive : true,
              parentCategoryId: category._id.toString() // Always include parentCategoryId
            })),
            createdAt: category.createdAt ? new Date(category.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString()
          };
        });
        
        console.log(`Total foods processed: ${totalFoods}`);
        return formattedCategories;
      } catch (error) {
        console.error(`Error formatting categories for restaurant ${parent._id}:`, error);
        return [];
      }
    }
  }
};