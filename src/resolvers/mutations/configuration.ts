import Configuration from '../../models/Configuration';

export default {
  Mutation: {
    saveEmailConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving email configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveFormEmailConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving form email configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveSendGridConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving SendGrid configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveFirebaseConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Firebase configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveSentryConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Sentry configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveGoogleApiKeyConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Google API Key configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveCloudinaryConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Cloudinary configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveAmplitudeApiKeyConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Amplitude API Key configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveGoogleClientIDConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Google Client ID configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveWebConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Web configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveAppConfigurations: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving App configurations: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveDeliveryRateConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Delivery Rate configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    savePaypalConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving PayPal configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveStripeConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Stripe configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveTwilioConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Twilio configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveVerificationsToggle: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Verification configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    saveCurrencyConfiguration: async (_: any, { configurationInput }: { configurationInput: any }) => {
      try {
        return await Configuration.findOneAndUpdate({}, configurationInput, { new: true, upsert: true });
      } catch (error) {
        throw new Error(`Error saving Currency configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  },
};