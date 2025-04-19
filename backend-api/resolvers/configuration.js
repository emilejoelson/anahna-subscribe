// resolvers/configuration.js
const Configuration = require('../models/configuration');

module.exports = {
  Query: {
      configuration: async () => {
        console.log('Fetching configuration');
        try {
          const configurations = await Configuration.findOne();
          console.log('Configurations:', configurations);
          return {
            ...configurations._doc,
            _id: configurations.id,
          };
          
        } catch (err) {
          console.error('Error fetching configurations:', err);
          throw new Error('Failed to fetch configurations');
        }
      },
    },
  Mutation: {
    saveEmailConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        email: configurationInput.email,
        emailName: configurationInput.emailName,
        password: configurationInput.password,
        enableEmail: configurationInput.enableEmail,
      });
      return await config.save();
    },
    saveFormEmailConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        formEmail: configurationInput.formEmail,
      });
      return await config.save();
    },
    saveSendGridConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        sendGridApiKey: configurationInput.sendGridApiKey,
        sendGridEnabled: configurationInput.sendGridEnabled,
        sendGridEmail: configurationInput.sendGridEmail,
        sendGridEmailName: configurationInput.sendGridEmailName,
        sendGridPassword: configurationInput.sendGridPassword,
      });
      return await config.save();
    },
    saveFirebaseConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        firebaseKey: configurationInput.firebaseKey,
        authDomain: configurationInput.authDomain,
        projectId: configurationInput.projectId,
        storageBucket: configurationInput.storageBucket,
        msgSenderId: configurationInput.msgSenderId,
        appId: configurationInput.appId,
        measurementId: configurationInput.measurementId,
        vapidKey: configurationInput.vapidKey,
      });
      return await config.save();
    },
    saveSentryConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        dashboardSentryUrl: configurationInput.dashboardSentryUrl,
        webSentryUrl: configurationInput.webSentryUrl,
        apiSentryUrl: configurationInput.apiSentryUrl,
        customerAppSentryUrl: configurationInput.customerAppSentryUrl,
        restaurantAppSentryUrl: configurationInput.restaurantAppSentryUrl,
        riderAppSentryUrl: configurationInput.riderAppSentryUrl,
      });
      return await config.save();
    },
    saveGoogleApiKeyConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      
      // Add validation to prevent duplicate script loading
      if (config.googleApiKey === configurationInput.googleApiKey) {
        return config;
      }
      
      Object.assign(config, {
        googleApiKey: configurationInput.googleApiKey,
      });
      return await config.save();
    },
    saveCloudinaryConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        cloudinaryUploadUrl: configurationInput.cloudinaryUploadUrl,
        cloudinaryApiKey: configurationInput.cloudinaryApiKey,
      });
      return await config.save();
    },
    saveAmplitudeApiKeyConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        webAmplitudeApiKey: configurationInput.webAmplitudeApiKey,
        appAmplitudeApiKey: configurationInput.appAmplitudeApiKey,
      });
      return await config.save();
    },
    saveGoogleClientIDConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        webClientID: configurationInput.webClientID,
        androidClientID: configurationInput.androidClientID,
        iOSClientID: configurationInput.iOSClientID,
        expoClientID: configurationInput.expoClientID,
      });
      return await config.save();
    },
    saveWebConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }

      // Check if libraries are already configured
      if (config.googleMapLibraries && 
          config.googleMapLibraries.toString() === configurationInput.googleMapLibraries) {
        return config;
      }

      Object.assign(config, {
        googleMapLibraries: configurationInput.googleMapLibraries?.split(',') || ['places'],
        googleColor: configurationInput.googleColor,
      });
      return await config.save();
    },
    saveAppConfigurations: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        termsAndConditions: configurationInput.termsAndConditions,
        privacyPolicy: configurationInput.privacyPolicy,
        testOtp: configurationInput.testOtp,
      });
      return await config.save();
    },
    saveDeliveryRateConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        deliveryRate: configurationInput.deliveryRate,
        costType: configurationInput.costType,
      });
      return await config.save();
    },
    savePaypalConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        clientId: configurationInput.clientId,
        clientSecret: configurationInput.clientSecret,
        sandbox: configurationInput.sandbox,
      });
      return await config.save();
    },
    saveStripeConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        publishableKey: configurationInput.publishableKey,
        secretKey: configurationInput.secretKey,
      });
      return await config.save();
    },
    saveTwilioConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        twilioAccountSid: configurationInput.twilioAccountSid,
        twilioAuthToken: configurationInput.twilioAuthToken,
        twilioPhoneNumber: configurationInput.twilioPhoneNumber,
        twilioEnabled: configurationInput.twilioEnabled,
      });
      return await config.save();
    },
    // saveVerificationsToggle: async (_, { configurationInput }) => {
    //   let config = await Configuration.findOne();
    //   if (!config) {
    //     config = new Configuration();
    //   }
    //   Object.assign(config, {
    //     skipEmailVerification: configurationInput.skipEmailVerification,
    //     skipMobileVerification: configurationInput.skipMobileVerification,
    //   });
    //   return await config.save();
    // },
    saveCurrencyConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) {
        config = new Configuration();
      }
      Object.assign(config, {
        currency: configurationInput.currency,
        currencySymbol: configurationInput.currencySymbol,
      });
      return await config.save();
    },
  },
};