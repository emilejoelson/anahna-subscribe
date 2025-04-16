const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  location: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
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
