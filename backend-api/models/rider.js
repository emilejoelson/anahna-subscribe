const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const riderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
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
  isAvailable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentWalletAmount: {
    type: Number,
    default: 0
  },
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
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
  notificationToken: String
}, {
  timestamps: true
});

riderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Rider', riderSchema);
