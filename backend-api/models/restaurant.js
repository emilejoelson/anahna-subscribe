const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openingTimeSchema = new Schema({
  day: {
    type: String,
    required: true
  },
  times: [{
    startTime: [String],// ["11", "00"] <=> 11:00
    endTime: [String]
  }]
});

const coordinatesSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    default: [0.0, 0.0]
  }
});

const deliveryInfoSchema = new Schema({
  minDeliveryFee: Number,
  deliveryDistance: Number,
  deliveryFee: Number
});

const deliveryBoundsSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    default: 'Polygon'
  },
  coordinates: {
    type: [[[Number]]],
    default: [ [0,0], [0,1], [1,1], [1,0], [0,0] ],// polygon coordinates
  }
});

const circleBoundsSchema = new Schema({
  radius: Number
});

const bussinessDetailsSchema = new Schema({
  bankName: String,
  accountName: String,
  accountCode: String,
  accountNumber: String,
  bussinessRegNo: String,
  companyRegNo: String,
  taxRate: Number
});

// Create a sub-schema for embedded addons
const addonEmbeddedSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  quantityMinimum: {
    type: Number,
    default: 0
  },
  quantityMaximum: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

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
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  addons: [{
    type: Schema.Types.Mixed,
    ref: 'Addon' // This allows for both embedded documents and references
  }],
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  location: {
    type: coordinatesSchema,
    index: '2dsphere'
  },
  deliveryBounds: deliveryBoundsSchema,
  address: String,
  orderPrefix: String,
  orderId: {
    type: Number,
    default: 0
  },
  slug: String,
  deliveryTime: {
    type: Number,
    // default: 30
  },
  minimumOrder: {
    type: Number,
    // default: 30
  },
  // sections: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Section'
  // },
  rating: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  stripeDetailsSubmitted: {
    type: Boolean,
    default: false
  },
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
  openingTimes: [openingTimeSchema],
  deliveryInfo: deliveryInfoSchema,
  boundType: {
    type: String,
  },
  city: {
    type: String,
  },
  postCode: {
    type: String,
  },
  circleBounds: circleBoundsSchema,
  bussinessDetails: bussinessDetailsSchema,
  currentWalletAmount: {
    type: Number,
    default: 0
  },
  totalWalletAmount: {
    type: Number,
    default: 0
  },
  withdrawnWalletAmount: {
    type: Number,
    default: 0
  },
  reviewData: {
    total: Number,
    ratings: Number,
    reviews:[{
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }],
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);