const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configurationSchema = new Schema({
  // Firebase Configuration
  firebaseKey: String,
  projectId: String,
  clientEmail: String,
  privateKey: String,

  // Email Configuration
  sendGridApiKey: String,
  sendGridEmail: String,
  sendGridEmailName: String,
  formEmail: String,

  // SMS Configuration
  twilioAccountSid: String,
  twilioAuthToken: String,
  twilioPhoneNumber: String,

  // Delivery Configuration
  deliveryRate: Number,
  costType: {
    type: String,
    enum: ['fixed', 'distance'],
    default: 'fixed'
  },

  // Currency Configuration
  currency: String,
  currencySymbol: String,

  // Verification Settings
  skipEmailVerification: {
    type: Boolean,
    default: false
  },
  skipMobileVerification: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema);
