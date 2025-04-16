const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CUISINE', 'RESTAURANT', 'LINK', 'NONE']
  },
  targetId: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
