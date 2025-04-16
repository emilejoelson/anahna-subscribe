// models/User.js
import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  deliveryAddress: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  isActive: { type: Boolean, default: true },
  addresses: [AddressSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', UserSchema);