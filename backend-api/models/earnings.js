const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const earningsSchema = new Schema({
  rider: {
    type: Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Earnings', earningsSchema);
