const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toHexString(), // ou uuidv4()
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
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  orderAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  deliveryCharges: Number,
  tipping: Number,
  taxationAmount: Number,
  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
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
  orderDate: Date,
  expectedTime: Date,
  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  assignedAt: Date,
  reason: String,
  isPickedUp: {
    type: Boolean,
    default: false
  },
  isRinged: {
    type: Boolean,
    default: false
  },
  isRinged: {
    type: Boolean,
    default: false
  },
  instructions: String,
}, {
  timestamps: true
});

orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
