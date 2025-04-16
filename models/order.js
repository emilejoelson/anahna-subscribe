const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  rider: {
    type: Schema.Types.ObjectId,
    ref: 'Rider'
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }],
  orderAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  deliveryCharges: Number,
  tipping: {
    type: Number,
    default: 0
  },
  taxationAmount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'PICKED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'CARD', 'WALLET', 'PAYPAL', 'STRIPE'],
    default: 'COD'
  },
  deliveryAddress: {
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    },
    deliveryAddress: String,
    details: String
  },
  isPickedUp: {
    type: Boolean,
    default: false
  },
  isRinged: {
    type: Boolean,
    default: true
  },
  instructions: String,
  completionTime: Date,
  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  assignedAt: Date,
  reason: String
}, {
  timestamps: true
});

orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
