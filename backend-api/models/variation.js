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
  food: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Variation', variationSchema);
