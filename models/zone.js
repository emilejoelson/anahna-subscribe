const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Polygon'
    },
    coordinates: [[Number]]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

zoneSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
