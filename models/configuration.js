const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configurationSchema = new Schema({
  // Firebase Configuration
  firebaseKey: String,
  authDomain: String,
  projectId: String,
  storageBucket: String,
  msgSenderId: String,
  appId: String,
  measurementId: String,
  vapidKey: String,

  // Payment Configuration
  clientId: String,
  clientSecret: String,
  sandbox: Boolean,
  publishableKey: String,
  secretKey: String,

  // Currency Configuration
  currency: String,
  currencySymbol: String,

  // Twilio Configuration
  twilioAccountSid: String,
  twilioAuthToken: String,
  twilioPhoneNumber: String,
  twilioEnabled: Boolean,

  // SendGrid Configuration
  sendGridApiKey: String,
  sendGridEnabled: Boolean,
  sendGridEmail: String,
  sendGridEmailName: String,
  sendGridPassword: String,

  // Google Configuration
  googleApiKey: String,
  webClientID: String,
  androidClientID: String,
  iOSClientID: String,
  expoClientID: String,
  googleMapLibraries: String,
  googleColor: String,

  // App Configuration
  termsAndConditions: String,
  privacyPolicy: String,
  testOtp: String,
  skipEmailVerification: Boolean,
  skipMobileVerification: Boolean,

  // Demo Configuration
  enableRiderDemo: Boolean,
  enableRestaurantDemo: Boolean,
  enableAdminDemo: Boolean,

  // Form Configuration
  formEmail: String,

  // Delivery Configuration
  deliveryRate: Number,
  costType: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema);
