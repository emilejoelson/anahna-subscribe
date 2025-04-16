const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  logo: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
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
  address: String,
  orderPrefix: String,
  orderId: {
    type: Number,
    default: 0
  },
  slug: String,
  deliveryTime: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
