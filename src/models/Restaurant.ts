import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  type: { type: String, default: 'Point' },
  coordinates: [Number]
});

const OpeningTimeSchema = new mongoose.Schema({
  day: String,
  times: [{ startTime: String, endTime: String }]
});

const DeliveryBoundsSchema = new mongoose.Schema({
  type: String,
  coordinates: [[[Number]]],
  circle: { center: [Number], radius: Number }
});

const BussinessDetailsSchema = new mongoose.Schema({
  vatNumber: String,
  registrationNumber: String,
});

const RestaurantSchema = new mongoose.Schema({
  name: String,
  image: String,
  username: String,
  orderPrefix: String,
  slug: String,
  phone: String,
  address: String,
  deliveryTime: String,
  minimumOrder: Number,
  isActive: { type: Boolean, default: true },
  commissionRate: Number,
  tax: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopType: String,
  orderId: Number,
  logo: String,
  password: String,
  location: { type: LocationSchema, index: '2dsphere' },
  cuisines: [String],
  isAvailable: { type: Boolean, default: true },
  openingTimes: [OpeningTimeSchema],
  deliveryBounds: DeliveryBoundsSchema,
  bussinessDetails: BussinessDetailsSchema,
  minDeliveryFee: Number,
  deliveryDistance: Number,
  deliveryFee: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

RestaurantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Restaurant', RestaurantSchema);