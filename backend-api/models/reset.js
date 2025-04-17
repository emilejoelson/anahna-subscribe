const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resetSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 24*60*60*1000) // 24 hours from now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reset', resetSchema);
