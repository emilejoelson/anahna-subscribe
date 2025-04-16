const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  name: {
    type: String,
    default: ''
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
  image: String,
  userType: {
    type: String,
    enum: ['ADMIN', 'VENDOR', 'RESTAURANT', 'STAFF'],
    default: 'VENDOR'
  },
  userTypeId: String,
  permissions: [String],
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Owner', ownerSchema);
