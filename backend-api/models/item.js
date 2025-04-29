const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  food: {
    type: Schema.Types.ObjectId,
    ref: 'Food'
  },
  title: String,
  description: String,
  image: String,
  quantity: Number,
  variation: {
    type: Schema.Types.ObjectId,
    ref: 'Variation'
  },
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  specialInstructions: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
