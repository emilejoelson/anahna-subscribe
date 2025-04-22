const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  details: String,
  label: String,
  selected: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

addressSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);
