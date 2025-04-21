const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const optionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  addon: {
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Option', optionSchema);
