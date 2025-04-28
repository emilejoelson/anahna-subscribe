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
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  variations: [{
    type: Schema.Types.ObjectId,
    ref: 'Variation'
  }],
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  isOutOfStock: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
