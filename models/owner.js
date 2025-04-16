const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Owner', ownerSchema);
