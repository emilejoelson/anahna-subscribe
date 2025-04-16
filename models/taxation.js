const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taxationSchema = new Schema({
  taxationCharges: {
    type: Number,
    required: true
  },
  enabled: {
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

module.exports = mongoose.model('Taxation', taxationSchema);
