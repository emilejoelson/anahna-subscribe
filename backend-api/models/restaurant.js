const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  unique_restaurant_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toHexString(), // ou uuidv4()
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  logo: String,
  phone:String,
  // email: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  categories: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    // required: true
  },
  options: {
    type: Schema.Types.ObjectId,
    ref: 'Option',
    // required: true
  },
  addons: {
    type: Schema.Types.ObjectId,
    ref: 'Addon',
    // required: true
  },
  // reviewData: ReviewData
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    // required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  deliveryBounds: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]],
      default: [ [0,0], [0,1], [1,1], [1,0], [0,0] ],// polygon coordinates
    }
  },
  address: String,
  orderPrefix: String,
  orderId: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  slug: String,
  deliveryTime: {
    type: Number,
    default: 30
  },
  minimumOrder: {
    type: Number,
    default: 30
  },
  sections: {
    type: [String],
    default: 30
  },
  rating: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  stripeDetailsSubmitted: String,
  commissionRate: Number,
  notificationToken: String,
  enableNotification: String,
  shopType: String,
  cuisines: {
    type: [String],
    default: []
  },
  keywords: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  reviewCount: Number,
  reviewAverage: Number,
  restaurantUrl: String,
  tax: Number,
  openingTimes: [{
    day: {
      type: String,
      required: true,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    },
    times: [{
      startTime: [String], // 00:00
      endTime: [String]  //
    }]
  }],
  deliveryInfo: {
    minDeliveryFee: {
      type: Number,
      default: 0
    },
    deliveryDistance: {
      type: Number,
      default: 0
      // required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
      // required: true
    }
  },
  boundType: {
    type: String,
    default: 'circle', // or 'polygon'
  },
  city: {
    type: String,
  },
  postCode: {
    type: String,
  },
  circleBounds: {
    radius: {
      type: Number,
      default: 0
    }
  },
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ deliveryBounds: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
