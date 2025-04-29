const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    // unique: true
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
  tipping: Number,
  taxationAmount: Number,
  deliveryAddress: {
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    },
    deliveryAddress: String,
    details: String,
    label: String,
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED', 'DELIVERED', 'CANCELLED'],
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
  rider: {
    type: Schema.Types.ObjectId,
    ref: 'Rider'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  preparationTime: Date,
  completionTime: Date,
  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  reason: String,
  isPickedUp: {
    type: Boolean,
    default: false
  },
  status: String,
  expectedTime: Date,
  orderDate: String,
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }
}, {
  timestamps: true
});

orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
