const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {  // Changed from 'content' to 'message' to match GraphQL
    type: String,
    required: true
  },
  user: {  // Changed from sender/senderModel to match GraphQL structure
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'user.model'
    },
    name: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true,
      enum: ['Rider', 'Restaurant', 'Customer']
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);