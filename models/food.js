const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  variations: [{
    title: String,
    price: Number
  }],
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
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

module.exports = mongoose.model('Food', foodSchema);
