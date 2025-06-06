const Food = require("../models/food");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");
const Addon = require("../models/addon");
const Owner = require("../models/owner");
const Offer = require("../models/offer");
const Section = require("../models/section");
const Zone = require("../models/zone");
const Rider = require("../models/rider");
const Earnings = require("../models/earnings");
const Review = require("../models/review");
const Order = require("../models/order");
const Option = require("../models/option");
const mongoose = require("mongoose");

const { dateToString } = require("../helpers/date");
const { SHOP_TYPE } = require("../helpers/enum");

const variations = async (variations) => {
  try {
    return variations.map((doc) => {
      return transformVariation(doc);
    });
  } catch (err) {
    throw err;
  }
};

const transformVariation = (variation) => {
  return {
    ...variation._doc,
    _id: variation.id,
  };
};

const foods = async (foodIds) => {
  try {
    const foods = await Food.find({ _id: { $in: foodIds } });
    foods.sort((a, b) => {
      return (
        foodIds.indexOf(a._id.toString()) - foodIds.indexOf(b._id.toString())
      );
    });
    return foods.map((food) => {
      return transformFood(food);
    });
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
    };
  } catch (err) {
    throw err;
  }
};

const rider = async (riderId) => {
  try {
    const rider = await Rider.findById(riderId.toString());
    if (!rider) {
      console.log("Rider not found for ID:", riderId);
      return null;
    }
    return {
      ...rider._doc,
      _id: rider.id,
      name: rider.name || "",
      username: rider.username || "",
      phone: rider.phone || "",
      isAvailable: rider.isAvailable !== undefined ? rider.isAvailable : false,
      zone: rider.zone ? zone.bind(this, rider.zone) : null,
    };
  } catch (err) {
    console.error("Error fetching rider:", err);
    throw err;
  }
};

const transformRider = (rider) => {
  if (!rider) return null;
  return {
    ...rider._doc,
    _id: rider.id,
    name: rider.name || "",
    username: rider.username || "",
    phone: rider.phone || "",
    isAvailable: rider.isAvailable !== undefined ? rider.isAvailable : false,
    zone: rider.zone ? zone.bind(this, rider.zone) : null,
  };
};

const zone = async (id) => {
  try {
    const zone = await Zone.findById(id);
    if (!zone) {
      console.log("Zone not found for ID:", id);
      return null;
    }
    return {
      ...zone._doc,
      _id: zone.id,
    };
  } catch (error) {
    throw error;
  }
};

const transformFood = (food) => {
  // Handle null/undefined food
  if (!food) {
    console.warn("Attempted to transform null food item");
    return {
      _id: new mongoose.Types.ObjectId().toString(),
      title: "Unknown Food Item",
      description: "",
      variations: [],
      image: "",
      isActive: true,
      createdAt: dateToString(new Date()),
      updatedAt: dateToString(new Date()),
    };
  }

  // Handle the case when food._id is a Buffer
  let foodId;
  if (food._id) {
    if (Buffer.isBuffer(food._id)) {
      foodId = food._id.toString("hex");
    } else if (food._id.toString) {
      foodId = food._id.toString();
    } else {
      foodId = String(food._id);
    }
  } else if (food.id) {
    foodId = food.id;
  } else {
    foodId = new mongoose.Types.ObjectId().toString();
    console.warn("Generated placeholder ID for food item without ID");
  }

  const foodDoc = food._doc || food;

  return {
    ...foodDoc,
    _id: foodId,
    // Ensure these fields are never null
    title: foodDoc.title || "New Food Item",
    description: foodDoc.description !== undefined ? foodDoc.description : "",
    image: foodDoc.image || "",
    isActive: foodDoc.isActive !== undefined ? foodDoc.isActive : true,
    isOutOfStock:
      foodDoc.isOutOfStock !== undefined ? foodDoc.isOutOfStock : false,
    variations: variations.bind(this, food.variations || []),
    createdAt: foodDoc.createdAt
      ? dateToString(foodDoc.createdAt)
      : dateToString(new Date()),
    updatedAt: foodDoc.updatedAt
      ? dateToString(foodDoc.updatedAt)
      : dateToString(new Date()),
  };
};

const review = async (reviewId) => {
  if (!reviewId) return null;
  const review = await Review.findById(reviewId);
  if (!review) return null;
  return {
    ...review._doc,
    _id: review.id,
    createdAt: dateToString(review._doc.createdAt),
    updatedAt: dateToString(review._doc.updatedAt),
  };
};

const transformFoods = async (foodIds) => {
  return await foods(foodIds);
};

const restaurant = async (restaurantId) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId.toString());
    if (!restaurant) {
      console.warn("Restaurant not found for ID:", restaurantId);
      return null;
    }
    return {
      _id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image || "",
      address: restaurant.address || "",
      location: restaurant.location,
      slug: restaurant.slug,
      keywords: restaurant.keywords || [],
      tags: restaurant.tags || [],
      reviewCount: restaurant.reviewCount || 0,
      reviewAverage: restaurant.reviewAverage || 0,
    };
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    return null;
  }
};

const transformOrder = async (order) => {
  try {
    if (!order) {
      throw new Error("Order is null or undefined");
    }

    // Transformer les items
    const items = (order.items || []).map((item) => {
      return {
        ...item._doc,
        variation: item.variation
          ? {
              ...item.variation,
              ...(item.variation._doc || {}),
            }
          : null,

        // Transformer les addons de chaque item
        addons: (item.addons || []).map(async (addon) => {
          const addonData = {
            ...addon,
            ...(addon._doc || {}),
            options: [], // Initialiser les options de l'addon
          };

          // Peupler les options choisies dans cet addon
          if (item.options && item.options.length > 0) {
            // Filtrer et peupler les options qui sont référencées dans `item.options`
            const selectedOptions = await Option.find({
              _id: { $in: item.options },
            });

            addonData.options = selectedOptions.map((option) => ({
              _id: option._id,
              title: option.title,
              description: option.description,
              price: option.price,
            }));
          }

          return addonData;
        }),
      };
    });

    // Attendre que toutes les promesses de transformation des addons soient résolues
    const resolvedItems = await Promise.all(items);

    // Fetch rider data directly if it exists
    let riderData = null;
    if (order.rider) {
      const riderDoc = await Rider.findById(order.rider);
      if (riderDoc) {
        riderData = await rider(order.rider);
      }
    }

    // Formater l'objet de commande
    const formattedOrder = {
      ...order._doc,
      _id: order.id,
      items: resolvedItems, // Remplacer les items transformés
      user: order.user ? user.bind(this, order.user) : null,
      restaurant: order.restaurant
        ? restaurant.bind(this, order.restaurant)
        : null,
      rider: riderData,
      orderStatus: order.orderStatus || "PENDING",
      createdAt: order._doc.createdAt
        ? new Date(order._doc.createdAt).toISOString()
        : null,
      updatedAt: order._doc.updatedAt
        ? new Date(order._doc.updatedAt).toISOString()
        : null,
      acceptedAt: order._doc.acceptedAt
        ? new Date(order._doc.acceptedAt).toISOString()
        : null,
      assignedAt: order._doc.assignedAt
        ? new Date(order._doc.assignedAt).toISOString()
        : null,
      pickedAt: order._doc.pickedAt
        ? new Date(order._doc.pickedAt).toISOString()
        : null,
      deliveredAt: order._doc.deliveredAt
        ? new Date(order._doc.deliveredAt).toISOString()
        : null,
      cancelledAt: order._doc.cancelledAt
        ? new Date(order._doc.cancelledAt).toISOString()
        : null,
      completionTime: order._doc.completionTime
        ? new Date(order._doc.completionTime).toISOString()
        : null,
    };

    return formattedOrder;
  } catch (err) {
    console.error("Error transforming order:", err);
    throw err;
  }
};

// const transformOrder = async order => {
//   try {
//     if (!order) {
//       throw new Error('Order is null or undefined');
//     }

//     const items = (order.items || []).map(item => {
//       return {
//         ...item,
//         variation: item.variation ? {
//           ...item.variation,
//           ...(item.variation._doc || {})
//         } : null,
//         addons: (item.addons || []).map(addon => ({
//           ...addon,
//           ...(addon._doc || {})
//         }))
//       };
//     });

//     // Fetch rider data directly if it exists
//     let riderData = null;
//     if (order.rider) {
//       const riderDoc = await Rider.findById(order.rider);
//       if (riderDoc) {
//         riderData = await rider(order.rider);
//       }
//     }

//     const formattedOrder = {
//       ...order._doc,
//       _id: order.id,
//       items,
//       user: order.user ? user.bind(this, order.user) : null,
//       restaurant: order.restaurant ? restaurant.bind(this, order.restaurant) : null,
//       rider: riderData,
//       orderStatus: order.orderStatus || 'PENDING',
//       createdAt: order._doc.createdAt ? new Date(order._doc.createdAt).toISOString() : null,
//       updatedAt: order._doc.updatedAt ? new Date(order._doc.updatedAt).toISOString() : null,
//       acceptedAt: order._doc.acceptedAt ? new Date(order._doc.acceptedAt).toISOString() : null,
//       pickedAt: order._doc.pickedAt ? new Date(order._doc.pickedAt).toISOString() : null,
//       deliveredAt: order._doc.deliveredAt ? new Date(order._doc.deliveredAt).toISOString() : null,
//       cancelledAt: order._doc.cancelledAt ? new Date(order._doc.cancelledAt).toISOString() : null,
//       completionTime: order._doc.completionTime ? new Date(order._doc.completionTime).toISOString() : null
//     };

//     return formattedOrder;
//   } catch (err) {
//     console.error('Error transforming order:', err);
//     throw err;
//   }
// };

const populateReviewsDetail = async (restaurantId) => {
  const data = await Review.find({ restaurant: restaurantId })
    .sort({ createdAt: -1 })
    .limit(10);
  const result = await Review.aggregate([
    { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: restaurantId, average: { $avg: "$rating" } } },
  ]);
  const reviewData = result.length > 0 ? result[0] : { average: 0 };
  const reviewCount = await Review.countDocuments({ restaurant: restaurantId });
  return {
    reviews: data.map(transformReview),
    ratings: reviewData.average.toFixed(2),
    total: reviewCount,
  };
};

const populateOrderAddons = async (addon) => {
  return {
    ...addon._doc,
    _id: addon.id,
    options: addon.options.map(populateOrderOptions),
  };
};

const populateOrderOptions = async (option) => {
  return {
    ...option._doc,
    _id: option.id,
  };
};

const populateRestaurantDetail = async (restaurantId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
  });
  return {
    ...restaurant._doc,
    _id: restaurant.id,
  };
};

const categoryFoods = async (foods) => {
  // Log the number of foods being processed
  console.log(`Processing ${foods.length} foods in categoryFoods function`);

  // Return actual food objects directly - don't use a binding function
  return foods.map((food) => {
    // Ensure food has valid ID and all required properties
    const foodObj = food._doc || food;
    const foodId = food._id
      ? food._id.toString()
      : new mongoose.Types.ObjectId().toString();

    return {
      ...foodObj,
      _id: foodId,
      title: foodObj.title || "Unnamed Food",
      description: foodObj.description || "",
      image: foodObj.image || "",
      isActive: foodObj.isActive !== undefined ? foodObj.isActive : true,
      isOutOfStock:
        foodObj.isOutOfStock !== undefined ? foodObj.isOutOfStock : false,
      subCategory: foodObj.subCategory || "",
      // Directly transform variations here instead of binding
      variations: (food.variations || []).map((variation) => {
        const variationId = variation._id;
        return {
          _id: variationId.toString(),
          title: variation.title || "Default Variation",
          price: variation.price || 0,
          discounted: variation.discounted || null,
          addons: variation.addons || [],
          isOutOfStock:
            variation.isOutOfStock !== undefined
              ? variation.isOutOfStock
              : false,
        };
      }),
      createdAt: foodObj.createdAt
        ? dateToString(foodObj.createdAt)
        : dateToString(new Date()),
      updatedAt: foodObj.updatedAt
        ? dateToString(foodObj.updatedAt)
        : dateToString(new Date()),
    };
  });
};

const transformCategory = async (category) => {
  if (!category) return null;
  const now = new Date().toISOString();
  return {
    ...category._doc,
    _id: category.id,
    foods: categoryFoods.bind(this, category.foods),
    createdAt: category._doc.createdAt
      ? dateToString(category._doc.createdAt)
      : now,
    updatedAt: category._doc.updatedAt
      ? dateToString(category._doc.updatedAt)
      : now,
  };
};

const transformCategories = async (categories) => {
  return categories.map(transformCategory);
};

const transformReview = (review) => {
  return {
    ...review._doc,
    _id: review.id,
    order: populateOrder.bind(this, review.order),
    restaurant: populateRestaurantDetail.bind(this, review.restaurant),
  };
};

const populateOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  return transformOrder(order);
};

const transformOption = async (option) => {
  return {
    ...option._doc,
    _id: option.id,
  };
};

const transformAddon = async (addon) => {
  // Skip null/undefined addons entirely
  if (!addon) {
    console.log("Warning: Attempted to transform null addon");
    return {
      _id: new mongoose.Types.ObjectId().toString(),
      title: "Unknown Addon", // Non-null placeholder
      description: "",
      options: [],
      quantityMinimum: 0,
      quantityMaximum: 1,
      isActive: true,
    };
  }

  // Handle the case when addon is already a plain object (not a Mongoose document)
  if (!addon._doc && addon._id) {
    return {
      ...addon,
      _id: addon._id.toString ? addon._id.toString() : addon._id,
      title: addon.title || "Unnamed Addon", // Ensure title is never null
      description: addon.description || "",
      options: Array.isArray(addon.options)
        ? addon.options.map((opt) =>
            typeof opt === "object" && opt._id
              ? opt._id.toString()
              : opt.toString()
          )
        : [],
      quantityMinimum: addon.quantityMinimum ?? 0,
      quantityMaximum: addon.quantityMaximum ?? 1,
      isActive: addon.isActive ?? true,
    };
  }

  // Handle the standard Mongoose document case
  return {
    ...addon._doc,
    _id: addon.id,
    title: addon._doc.title || "Unnamed Addon", // Ensure title is never null
    description: addon._doc.description || "",
    options: Array.isArray(addon._doc.options)
      ? addon._doc.options.map((opt) =>
          typeof opt === "object" && opt._id
            ? opt._id.toString()
            : opt.toString()
        )
      : [],
    quantityMinimum: addon._doc.quantityMinimum ?? 0,
    quantityMaximum: addon._doc.quantityMaximum ?? 1,
    isActive: addon._doc.isActive ?? true,
  };
};

const populateCategories = async (categories) => {
  return categories.map(transformCategory);
};

const populateOptions = async (options) => {
  return await options.map(transformOption);
};

const populateAddons = async (addons) => {
  // Safety check - if addons is null or not an array, return empty array
  if (!addons || !Array.isArray(addons)) {
    console.log("Warning: populateAddons received null or non-array input");
    return [];
  }

  // Filter out any null/undefined items before transformation
  const validAddons = addons.filter(
    (addon) => addon !== null && addon !== undefined
  );

  // Transform each addon and catch any errors that might occur
  const transformedAddons = await Promise.all(
    validAddons.map(async (addon, index) => {
      try {
        return await transformAddon(addon);
      } catch (error) {
        console.error(`Error transforming addon at index ${index}:`, error);
        // Return a valid placeholder addon instead of letting the error propagate
        return {
          _id: new mongoose.Types.ObjectId().toString(),
          title: "Error Addon", // Non-null placeholder
          description: "An error occurred processing this addon",
          options: [],
          quantityMinimum: 0,
          quantityMaximum: 1,
          isActive: false,
        };
      }
    })
  );

  return transformedAddons;
};

/**
 * Transform an array of restaurant documents into properly formatted objects
 * @param {Array} restaurants - Array of restaurant documents from MongoDB
 * @returns {Promise<Array>} - Promise resolving to an array of transformed restaurant objects
 */
const transformRestaurants = async (restaurants) => {
  try {
    // Log the input data for debugging
    console.log(
      `Processing ${restaurants.length} restaurants for transformation`
    );

    // Use Promise.all to handle the async transformations in parallel
    const transformedRestaurants = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          return await transformRestaurant(restaurant);
        } catch (error) {
          console.error(
            `Error transforming restaurant ${restaurant._id || "unknown"}:`,
            error
          );
          // Return a minimal valid object to prevent the entire array from failing
          return {
            _id: restaurant._id?.toString() || "unknown",
            name: restaurant.name || "Error in Restaurant",
            categories: [],
            options: [],
            addons: [],
            isActive: false,
          };
        }
      })
    );

    // Log the output data for debugging
    console.log(
      `Successfully transformed ${transformedRestaurants.length} restaurants`
    );
    if (transformedRestaurants.length > 0) {
      console.log(
        `First transformed restaurant _id: ${transformedRestaurants[0]._id}`
      );
    }

    return transformedRestaurants;
  } catch (error) {
    console.error("Error in transformRestaurants:", error);
    throw error;
  }
};

/**
 * Transform a single restaurant document into a properly formatted object
 * @param {Object} restaurant - Restaurant document from MongoDB
 * @returns {Promise<Object>} - Promise resolving to a transformed restaurant object
 */
const transformRestaurant = async (restaurant) => {
  if (!restaurant) {
    console.error("Attempted to transform null or undefined restaurant");
    return {
      _id: "unknown",
      name: "Unknown Restaurant",
      categories: [],
      options: [],
      addons: [],
      reviewData: { avgRating: 0, totalReviews: 0, ratings: [] },
      zone: null,
      owner: null,
      shopType: SHOP_TYPE.RESTAURANT,
    };
  }

  const restaurantData = restaurant._doc || restaurant;

  const formattedCategories = (restaurant.categories || []).map((category) => {
    const foodItems = (category.foods || []).map((food) => {
      return {
        _id: food._id.toString(),
        title: food.title || "Unnamed Food",
        description: food.description || "",
        image: food.image || "",
        isActive: food.isActive !== undefined ? food.isActive : true,
        isOutOfStock:
          food.isOutOfStock !== undefined ? food.isOutOfStock : false,
        subCategory: food.subCategory || "",
        variations: (food.variations || []).map((variation) => ({
          _id: variation._id.toString(),
          title: variation.title || "Default Variation",
          price: variation.price || 0,
          discounted: variation.discounted || null,
          addons: variation.addons?.map((addon) => addon._id.toString()) || [],
          isOutOfStock:
            variation.isOutOfStock !== undefined
              ? variation.isOutOfStock
              : false,
        })),
        createdAt: dateToString(food.createdAt || new Date()),
        updatedAt: dateToString(food.updatedAt || new Date()),
      };
    });

    return {
      _id: category._id.toString(),
      title: category.title || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive !== undefined ? category.isActive : true,
      foods: foodItems,
      subCategories: (category.subCategories || []).map((sub) => ({
        _id: sub._id.toString(),
        title: sub.title || "",
        description: sub.description || "",
        isActive: sub.isActive !== undefined ? sub.isActive : true,
        parentCategoryId: category._id.toString(),
      })),
      createdAt: dateToString(category.createdAt || new Date()),
      updatedAt: dateToString(category.updatedAt || new Date()),
    };
  });

  const restaurantId = restaurant._id.toString();
  const [options, addons, reviewData] = await Promise.all([
    populateOptions(restaurant.options || []),
    populateAddons(restaurant.addons || []),
    populateReviewsDetail(restaurantId),
  ]);

  let owner = null;
  try {
    if (restaurant.owner) {
      owner = await populateOwner(restaurant.owner);
    }
  } catch (error) {
    console.error(
      `Error populating owner for restaurant ${restaurantId}:`,
      error
    );
  }

  return {
    _id: restaurantId,
    name: restaurantData.name || "Unnamed Restaurant",
    description: restaurantData.description || "",
    image: restaurantData.image || "",
    cover: restaurantData.cover || "",
    address: restaurantData.address || {},
    location: restaurantData.location || { coordinates: [0, 0] },
    categories: formattedCategories,
    options,
    addons,
    reviewData,
    zone: restaurantData.zone || null,
    owner,
    shopType: restaurantData.shopType || SHOP_TYPE.RESTAURANT,
    isActive:
      restaurantData.isActive !== undefined ? restaurantData.isActive : true,
    openingTimes: restaurantData.openingTimes || [],
    tags: restaurantData.tags || [],
    isCloned: restaurantData.isCloned || false,
    createdAt: dateToString(restaurantData.createdAt || new Date()),
    updatedAt: dateToString(restaurantData.updatedAt || new Date()),
  };
};

const transformRestaurantNew = (restaurant) => {
  if (!restaurant) return null;

  return {
    _id: restaurant._id.toString(),
    unique_restaurant_id: restaurant.unique_restaurant_id,
    orderPrefix: restaurant.orderPrefix,
    name: restaurant.name,
    image: restaurant.image,
    logo: restaurant.logo,
    address: restaurant.address,
    location: restaurant.location,
    categories:
      restaurant.categories?.map((category) => ({
        _id: category._id.toString(),
        title: category.title,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        createdAt: category.createdAt?.toISOString(),
        updatedAt: category.updatedAt?.toISOString(),
        subCategories: category.subCategories || [],
        foods:
          category.foods?.map((food) => ({
            _id: food._id.toString(),
            title: food.title,
            description: food.description,
            image: food.image,
            isActive: food.isActive,
            createdAt: food.createdAt?.toISOString(),
            updatedAt: food.updatedAt?.toISOString(),
            subCategory: food.subCategory,
            isOutOfStock: food.isOutOfStock,
            variations:
              food.variations?.map((variation) => ({
                _id: variation._id.toString(),
                title: variation.title,
                price: variation.price,
                discounted: variation.discounted,
                addons: variation.addons,
                isOutOfStock: variation.isOutOfStock,
              })) || [],
          })) || [],
      })) || [],
    orderId: restaurant.orderId,
    options: restaurant.options || [],
    addons: restaurant.addons || [],
    reviewData: restaurant.reviewData
      ? {
          total: restaurant.reviewData.total,
          ratings: restaurant.reviewData.ratings,
          reviews: restaurant.reviewData.reviews || [],
        }
      : null,
    zone: restaurant.zone,
    username: restaurant.username,
    password: restaurant.password,
    deliveryTime: restaurant.deliveryTime,
    minimumOrder: restaurant.minimumOrder,
    sections: restaurant.sections || [],
    rating: parseFloat(restaurant.rating) || 0,
    isActive: restaurant.isActive,
    isAvailable: restaurant.isAvailable,
    openingTimes: restaurant.openingTimes,
    slug: restaurant.slug,
    stripeDetailsSubmitted: restaurant.stripeDetailsSubmitted,
    commissionRate: restaurant.commissionRate,
    owner: restaurant.owner
      ? {
          _id: restaurant.owner._id?.toString(),
          email: restaurant.owner.email,
        }
      : null,
    deliveryBounds: restaurant.deliveryBounds,
    tax: restaurant.tax,
    notificationToken: restaurant.notificationToken,
    enableNotification: restaurant.enableNotification === "true",
    shopType: restaurant.shopType,
    cuisines: restaurant.cuisines,
    keywords: restaurant.keywords,
    tags: restaurant.tags,
    reviewCount: restaurant.reviewCount,
    reviewAverage: restaurant.reviewAverage,
    restaurantUrl: restaurant.restaurantUrl,
    phone: restaurant.phone,
    salesTax: restaurant.salesTax,
    deliveryInfo: restaurant.deliveryInfo,
    boundType: restaurant.boundType,
    city: restaurant.city,
    postCode: restaurant.postCode,
    circleBounds: restaurant.circleBounds,
    bussinessDetails: restaurant.bussinessDetails,
    currentWalletAmount: restaurant.currentWalletAmount,
    totalWalletAmount: restaurant.totalWalletAmount,
    withdrawnWalletAmount: restaurant.withdrawnWalletAmount,
  };
};

const transformMinimalRestaurants = async (restaurants) => {
  return restaurants.map(transformMinimalRestaurantData);
};
const transformMinimalRestaurantData = async (restaurant) => {
  // Add a safety check to prevent returning null for _id
  if (!restaurant) {
    console.error(
      "Attempted to transform null or undefined restaurant for minimal data"
    );
    return {
      _id: "unknown",
      name: "Unknown Restaurant",
      shopType: SHOP_TYPE.RESTAURANT,
    };
  }

  // Handle case when restaurant might be a plain object without _doc property
  const restaurantData = restaurant._doc || restaurant;

  return {
    ...restaurantData,
    shopType: restaurant.shopType || SHOP_TYPE.RESTAURANT,
    _id: restaurant.id || restaurant._id?.toString() || "unknown",
  };
};

const populateOwnerRestaurant = async (restaurant) => {
  const restaurants = await Restaurant.find({ _id: { $in: restaurant } });
  return restaurants.map(transformRestaurant);
};

const transformOwner = async (owner) => {
  return {
    ...owner._doc,
    _id: owner.id,
    userId: owner.id,
    restaurants: await populateOwnerRestaurant(owner.restaurants),
  };
};

const transformUser = async (user) => {
  return {
    ...user._doc,
    password: null,
    _id: user.id,
    addresses: await populateAddresses(user.addresses),
  };
};

const populateAddresses = async (addresses) => {
  // const addresses = await Address.find({ _id: { $in: addressIds }, isActive: true }).sort({ createdAt: -1 })
  return addresses.map((address) => ({
    ...address._doc,
    _id: address.id,
  }));
};

const transformOffer = async (offer) => {
  return {
    ...offer._doc,
    _id: offer.id,
    restaurants: offer.restaurants.map(transformOfferRestaurant),
  };
};

const transformSection = async (section) => {
  return {
    ...section._doc,
    _id: section.id,
    restaurants: section.restaurants.map(transformSectionRestaurant),
  };
};
const transformSectionRestaurant = async (id) => {
  const restaurant = await Restaurant.findById(id);
  return {
    _id: restaurant.id,
    name: restaurant._doc.name,
  };
};

const transformOfferRestaurant = async (id) => {
  const restaurant = await Restaurant.findById(id);
  return {
    ...restaurant._doc,
    _id: restaurant.id,
  };
};

const transformZone = async (zone) => {
  return {
    ...zone._doc,
    _id: zone.id,
  };
};

const populateOwner = async (ownerId) => {
  const owner = await Owner.findById(ownerId);
  return transformOwner(owner);
};

const transformMessage = (message) => {
  return {
    id: message._id.toString(),
    message: message.message,
    user: {
      id: message.user.id.toString(),
      name: message.user.name
    },
    createdAt: message.createdAt.toISOString()
  };
};


const transformEarnings = async (earning) => {
  return {
    ...earning._doc,
    deliveryTime: dateToString(earning.deliveryTime),
    rider: populateRider(earning.rider),
  };
};

const populateRider = async (id) => await Rider.findById(id);

const transformWithDrawRequest = async (withDrawRequest) => {
  return {
    _id: withDrawRequest.id,
    ...withDrawRequest._doc,
    requestTime: dateToString(withDrawRequest.requestTime),
    rider: populateRider(withDrawRequest.rider),
  };
};

exports.transformCategory = transformCategory;
exports.transformFood = transformFood;
exports.transformFoods = transformFoods;
exports.transformOrder = transformOrder;
exports.transformReview = transformReview;
exports.transformOption = transformOption;
exports.transformAddon = transformAddon;
exports.transformRestaurants = transformRestaurants;
exports.transformRestaurant = transformRestaurant;
exports.transformCategories = transformCategories;
exports.transformOwner = transformOwner;
exports.transformUser = transformUser;
exports.transformOffer = transformOffer;
exports.transformSection = transformSection;
exports.transformZone = transformZone;
exports.transformRider = transformRider;
exports.transformMessage = transformMessage;
exports.transformEarnings = transformEarnings;
exports.transformWithDrawRequest = transformWithDrawRequest;
exports.transformMinimalRestaurantData = transformMinimalRestaurantData;
exports.transformMinimalRestaurants = transformMinimalRestaurants;
exports.transformRestaurantNew = transformRestaurantNew;
