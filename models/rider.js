const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const riderSchema = new Schema({
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
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  currentWalletAmount: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  notificationToken: String,
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  }
}, {
  timestamps: true
});

riderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Rider', riderSchema);
