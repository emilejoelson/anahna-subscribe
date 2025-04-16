const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

module.exports = mongoose.model('Point', pointSchema);
