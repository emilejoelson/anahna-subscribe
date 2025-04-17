const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    // required: true
  },
  expiryDate: {
    type: Date
  },
  enabled: {
    type: Boolean,
    default: true
  },
  minimumOrderAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
