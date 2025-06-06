const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
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
  foods: [{
    type: Schema.Types.ObjectId,
    ref: 'Food'
  }],
  subCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'SubCategory'
  }],
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);