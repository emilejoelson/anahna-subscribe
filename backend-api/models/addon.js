const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addonSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  quantityMinimum: {
    type: Number,
    default: 0,
    required: true
  },
  quantityMaximum: {
    type: Number,
    default: 1,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Addon', addonSchema);
