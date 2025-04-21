const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  enabled: {
    type: Boolean,
    default: true
  },

  description: String,
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);
