const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  image: String,
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
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
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
  address: String,
  isActive: {
    type: Boolean,
    default: true
  },
  orderPrefix: {
    type: String,
    default: 'ORD'
  },
  orderId: {
    type: Number,
    default: 0
  },
  deliveryTime: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
