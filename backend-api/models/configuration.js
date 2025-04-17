const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configurationSchema = new Schema({
  email: {
    type: String,
  },
  emailName: {
    type: String,
  },
  password: {
    type: String,
  },
  enableEmail: {
    type: Boolean,
    default: false,
  },
  formEmail: {
    type: String,
  },
  sendGridApiKey: {
    type: String,
  },
  sendGridEnabled: {
    type: Boolean,
    default: false,
  },
  sendGridEmail: {
    type: String,
  },
  sendGridEmailName: {
    type: String,
  },
  sendGridPassword: {
    type: String,
  },
  firebaseKey: {
    type: String,
  },
  authDomain: {
    type: String,
  },
  projectId: {
    type: String,
  },
  storageBucket: {
    type: String,
  },
  msgSenderId: {
    type: String,
  },
  appId: {
    type: String,
  },
  measurementId: {
    type: String,
  },
  vapidKey: {
    type: String,
  },
  dashboardSentryUrl: {
    type: String,
  },
  webSentryUrl: {
    type: String,
  },
  apiSentryUrl: {
    type: String,
  },
  customerAppSentryUrl: {
    type: String,
  },
  restaurantAppSentryUrl: {
    type: String,
  },
  riderAppSentryUrl: {
    type: String,
  },
  googleApiKey: {
    type: String,
  },
  cloudinaryUploadUrl: {
    type: String,
  },
  cloudinaryApiKey: {
    type: String,
  },
  webAmplitudeApiKey: {
    type: String,
  },
  appAmplitudeApiKey: {
    type: String,
  },
  webClientID: {
    type: String,
  },
  androidClientID: {
    type: String,
  },
  iOSClientID: {
    type: String,
  },
  expoClientID: {
    type: String,
  },
  googleMapLibraries: {
    type: [String],
  },
  googleColor: {
    type: String,
  },
  termsAndConditions: {
    type: String,
  },
  privacyPolicy: {
    type: String,
  },
  testOtp: {
    type: String,
  },
  deliveryRate: {
    type: Number,
  },
  costType: {
    type: String,
  },
  clientId: {
    type: String,
  },
  clientSecret: {
    type: String,
  },
  sandbox: {
    type: Boolean,
    default: false,
  },
  publishableKey: {
    type: String,
  },
  secretKey: {
    type: String,
  },
  twilioAccountSid: {
    type: String,
  },
  twilioAuthToken: {
    type: String,
  },
  twilioPhoneNumber: {
    type: String,
  },
  twilioEnabled: {
    type: Boolean,
    default: false,
  },
  skipEmailVerification: {
    type: Boolean,
    default: false,
  },
  skipMobileVerification: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
  },
  currencySymbol: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema);