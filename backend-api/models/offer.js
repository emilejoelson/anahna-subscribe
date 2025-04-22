const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
