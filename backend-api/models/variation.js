const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discounted: Number,
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  isOutOfStock: {
    type: Boolean,
    default: false
  },
  food: {
    type: Schema.Types.ObjectId,
    ref: 'Food'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Variation', variationSchema);
