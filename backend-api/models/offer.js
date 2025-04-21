const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  
  title: {
    type: String,
    required: true
  },
  description: String,
  image: String,
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
