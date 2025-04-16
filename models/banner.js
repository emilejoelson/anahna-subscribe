const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  file: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  screen: String,
  parameters: Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
