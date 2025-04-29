const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String
  },
  phone: {
    type: String,
    sparse: true
  },
  phoneIsVerified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailIsVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOrderNotification: {
    type: Boolean,
    default: false
  },
  isOfferNotification: {
    type: Boolean,
    default: false
  },
  addresses: [{
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    details: String,
    label: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  }],
  notificationToken: String,
  favourite: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  userType: {
    type: String,
    default: 'user'
  },
  webNotifications: [{
    _id: { 
      type: String, 
      default: () => new mongoose.Types.ObjectId().toString() 
    },
    body: String,
    navigateTo: String,
    read: { 
      type: Boolean, 
      default: false 
    },
    createdAt: { 
      type: String, 
      default: () => new Date().toISOString() 
    }
  }]
}, {
  timestamps: true
})

userSchema.index({ "addresses.location": "2dsphere" })

module.exports = mongoose.model('User', userSchema)