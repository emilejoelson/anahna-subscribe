const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cuisineSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cuisine', cuisineSchema);
