const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configurationSchema = new Schema({
  // Firebase Configuration
  firebaseKey: String,
  projectId: String,
  clientEmail: String,
  privateKey: String,

  // Payment Configuration
  clientId: String,
  clientSecret: String,
  sandbox: Boolean,
  publishableKey: String,
  secretKey: String,
  
  // Currency Configuration
  currency: String,
  currencySymbol: String,
  
  // Delivery Configuration
  deliveryRate: Number,
  costType: {
    type: String,
    enum: ['fixed', 'distance'],
    default: 'fixed'
  },
  
  // Email Configuration
  sendGridApiKey: String,
  sendGridEnabled: Boolean,
  sendGridEmail: String,
  sendGridEmailName: String,
  formEmail: String,
  
  // SMS Configuration
  twilioAccountSid: String,
  twilioAuthToken: String,
  twilioPhoneNumber: String,
  twilioEnabled: Boolean,
  
  // App Configuration
  termsAndConditions: String,
  privacyPolicy: String,
  testOtp: String,
  skipEmailVerification: Boolean,
  skipMobileVerification: Boolean,
  
  // Demo Configuration
  enableRiderDemo: Boolean,
  enableRestaurantDemo: Boolean,
  enableAdminDemo: Boolean
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema);
