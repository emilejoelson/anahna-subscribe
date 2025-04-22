const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  webNotifications: [{
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    body: String,
    navigateTo: String,
    read: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() }
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)