const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  image: String,
  address: String,
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  sections: [{
    type: Schema.Types.ObjectId,
    ref: 'Section'
  }],
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
