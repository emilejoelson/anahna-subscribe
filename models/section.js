const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  enabled: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);
