const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
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
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food'
    },
    quantity: Number,
    price: Number,
    variations: [{
      title: String,
      price: Number
    }],
    addons: [{
      type: Schema.Types.ObjectId,
      ref: 'Addon'
    }]
  }],
  orderAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    location: {
      coordinates: [Number]
    },
    deliveryAddress: String,
    details: String,
    label: String
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'WALLET'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  taxationAmount: Number,
  orderNumber: {
    type: String,
    unique: true
  },
  acceptedAt: Date,
  assignedAt: Date,
  pickedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['USER', 'RESTAURANT', 'RIDER', 'ADMIN']
  },
  cancellationReason: String
}, {
  timestamps: true
});

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
