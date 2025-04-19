const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  unique_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toHexString(), // ou uuidv4()
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  plainPassword: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }, // Add this field
  userType: {
    type: String,
    default: 'owner'
  },
  permissions: {
    type: [String],
    default: []
  },
  restaurants: [{
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Owner', ownerSchema);