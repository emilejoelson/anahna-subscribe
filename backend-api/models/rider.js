// models/rider.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const riderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: false
  },
  vehicleType: {
    type: String,
    required: true
  },
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  assigned: {
    type: Boolean,
    default: false
  },
  bussinessDetails: {
    bankName: String,
    accountName: String,
    accountCode: String,
    accountNumber: String,
    bussinessRegNo: String,
    companyRegNo: String,
    taxRate: Number
  },
  licenseDetails: {
    number: String,
    expiryDate: Date,
    image: String
  },
  vehicleDetails: {
    number: String,
    image: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rider', riderSchema);