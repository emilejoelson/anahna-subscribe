import mongoose from 'mongoose';

const RiderSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  available: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RiderSchema.index({ location: '2dsphere' });

export default mongoose.model('Rider', RiderSchema);