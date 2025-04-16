const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneIsVerified: {
    type: Boolean,
    default: false
  },
  emailIsVerified: {
    type: Boolean,
    default: false
  },
  addresses: [{
    location: {
      coordinates: [String]
    },
    deliveryAddress: String,
    details: String,
    label: String,
    selected: {
      type: Boolean,
      default: false
    }
  }],
  notificationToken: String,
  isOrderNotification: {
    type: Boolean,
    default: false
  },
  isOfferNotification: {
    type: Boolean,
    default: false
  },
  favourite: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  userType: {
    type: String,
    default: 'default'
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);