const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taxationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    default: 'PERCENTAGE'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Taxation', taxationSchema);
