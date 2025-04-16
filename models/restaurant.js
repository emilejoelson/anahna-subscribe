const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  image: String,
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  options: [{
    type: Schema.Types.ObjectId,
    ref: 'Option'
  }],
  addons: [{
    type: Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  sections: [{
    type: Schema.Types.ObjectId,
    ref: 'Section'
  }],
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
  isActive: {
    type: Boolean,
    default: true
  },
  shopType: {
    type: String,
    enum: ['RESTAURANT', 'GROCERY', 'PHARMACY'],
    default: 'RESTAURANT'
  }
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
