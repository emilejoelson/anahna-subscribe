const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
