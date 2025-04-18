const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openingTimeSchema = new Schema({
  day: {
    type: String,
    required: true
  },
  times: [{
    startTime: String,
    endTime: String
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
    default: [0, 0]
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
  coordinates: [[[Number]]]
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

const restaurantSchema = new Schema({
  unique_restaurant_id: {
    type: String,
    unique: true
  },
  orderId: {
    type: Number,
    unique: true
  },
  orderPrefix: String,
  name: {
    type: String,
    required: true
  },
  image: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  deliveryTime: String,
  minimumOrder: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  commissionRate: Number,
  tax: Number,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  shopType: String,
  logo: String,
  location: {
    type: coordinatesSchema,
    index: '2dsphere'
  },
  deliveryBounds: deliveryBoundsSchema,
  circleBounds: circleBoundsSchema,
  cuisines: [String],
  openingTimes: [openingTimeSchema],
  deliveryInfo: deliveryInfoSchema,
  isAvailable: {
    type: Boolean,
    default: true
  },
  stripeDetailsSubmitted: {
    type: Boolean,
    default: false
  },
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);