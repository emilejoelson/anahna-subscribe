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
  cloudinaryUploadPreset: {
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
    validate: {
      validator: function(libraries) {
        // Ensure only valid libraries are included and no duplicates
        const validLibraries = ['places', 'drawing', 'geometry', 'visualization'];
        const uniqueLibraries = [...new Set(libraries)];
        return uniqueLibraries.every(lib => validLibraries.includes(lib));
      },
      message: 'Invalid Google Maps library configuration'
    },
    default: ['places']
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
  isPaidVersion: {
    type: Boolean,
    default: false,
  },
  pushToken: {
    type: String,
  },
  enableRiderDemo: {
    type: Boolean,
    default: false,
  },
  enableRestaurantDemo: {
    type: Boolean,
    default: false,
  },
  enableAdminDemo: {
    type: Boolean,
    default: false,
  },
  maxDistanceInMeters:{
    type: Number,
    default: 10000
  }
}, {
  timestamps: true
});

// Middleware to prevent duplicate script loading
configurationSchema.pre('save', function(next) {
  if (this.isModified('googleApiKey') || this.isModified('googleMapLibraries')) {
    // Ensure libraries are unique
    if (this.googleMapLibraries) {
      this.googleMapLibraries = [...new Set(this.googleMapLibraries)];
    }
  }
  next();
});

module.exports = mongoose.model('Configuration', configurationSchema);