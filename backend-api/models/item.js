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
    title: String,
    price: Number
  },
  addons: [{
    title: String,
    description: String,
    options: [{
      title: String,
      price: Number
    }]
  }],
  specialInstructions: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
