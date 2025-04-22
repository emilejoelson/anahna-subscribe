const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stripeSchema = new Schema({
  orderId: String,
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }],
  orderAmount: Number,
  paidAmount: Number,
  deliveryCharges: Number,
  tipping: Number,
  taxationAmount: Number,
  orderStatus: String,
  paymentStatus: String,
  paymentMethod: {
    type: String,
    default: 'STRIPE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stripe', stripeSchema);
