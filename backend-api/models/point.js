const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

module.exports = mongoose.model('Point', pointSchema);
