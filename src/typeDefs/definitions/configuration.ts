import { gql } from 'apollo-server-express';

export default gql`
  type EmailConfiguration {
    _id: ID
    email: String
    emailName: String
    password: String
    enableEmail: Boolean
  }

  type FormEmailConfiguration {
    _id: ID
    formEmail: String
  }

  type SendGridConfiguration {
    _id: ID
    sendGridApiKey: String
    sendGridEnabled: Boolean
    sendGridEmail: String
    sendGridEmailName: String
    sendGridPassword: String
  }

  type FirebaseConfiguration {
    _id: ID
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    vapidKey: String
  }

  type SentryConfiguration {
    _id: ID
    dashboardSentryUrl: String
    webSentryUrl: String
    apiSentryUrl: String
    customerAppSentryUrl: String
    restaurantAppSentryUrl: String
    riderAppSentryUrl: String
  }

  type GoogleApiKeyConfiguration {
    _id: ID
    googleApiKey: String
  }

  type CloudinaryConfiguration {
    _id: ID
    cloudinaryUploadUrl: String
    cloudinaryApiKey: String
  }

  type AmplitudeApiKeyConfiguration {
    _id: ID
    webAmplitudeApiKey: String
    appAmplitudeApiKey: String
  }

  type GoogleClientIDConfiguration {
    _id: ID
    webClientID: String
    androidClientID: String
    iOSClientID: String
    expoClientID: String
  }

  type WebConfiguration {
    _id: ID
    googleMapLibraries: String
    googleColor: String
  }

  type AppConfigurations {
    _id: ID
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
  }

  type DeliveryCostConfiguration {
    _id: ID
    deliveryRate: Float
    costType: String
  }

  type PaypalConfiguration {
    _id: ID
    clientId: String
    clientSecret: String
    sandbox: Boolean
  }

  type StripeConfiguration {
    _id: ID
    publishableKey: String
    secretKey: String
  }

  type TwilioConfiguration {
    _id: ID
    twilioAccountSid: String
    twilioAuthToken: String
    twilioPhoneNumber: String
    twilioEnabled: Boolean
  }

  type VerificationConfiguration {
    skipEmailVerification: Boolean
    skipMobileVerification: Boolean
  }

  type CurrencyConfiguration {
    _id: ID
    currency: String
    currencySymbol: String
  }

  input EmailConfigurationInput {
    email: String!
    emailName: String!
    password: String!
    enableEmail: Boolean!
  }

  input FormEmailConfigurationInput {
    formEmail: String!
  }

  input SendGridConfigurationInput {
    sendGridApiKey: String!
    sendGridEnabled: Boolean!
    sendGridEmail: String!
    sendGridEmailName: String!
    sendGridPassword: String!
  }

  input FirebaseConfigurationInput {
    firebaseKey: String!
    authDomain: String!
    projectId: String!
    storageBucket: String!
    msgSenderId: String!
    appId: String!
    measurementId: String!
    vapidKey: String!
  }

  input SentryConfigurationInput {
    dashboardSentryUrl: String!
    webSentryUrl: String!
    apiSentryUrl: String!
    customerAppSentryUrl: String!
    restaurantAppSentryUrl: String!
    riderAppSentryUrl: String!
  }

  input GoogleApiKeyConfigurationInput {
    googleApiKey: String!
  }

  input CloudinaryConfigurationInput {
    cloudinaryUploadUrl: String!
    cloudinaryApiKey: String!
  }

  input AmplitudeApiKeyConfigurationInput {
    webAmplitudeApiKey: String!
    appAmplitudeApiKey: String!
  }

  input GoogleClientIDConfigurationInput {
    webClientID: String!
    androidClientID: String!
    iOSClientID: String!
    expoClientID: String!
  }

  input WebConfigurationInput {
    googleMapLibraries: String
    googleColor: String
  }

  input AppConfigurationsInput {
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
  }

  input DeliveryCostConfigurationInput {
    deliveryRate: Float!
    costType: String!
  }

  input PaypalConfigurationInput {
    clientId: String!
    clientSecret: String!
    sandbox: Boolean!
  }

  input StripeConfigurationInput {
    publishableKey: String!
    secretKey: String!
  }

  input TwilioConfigurationInput {
    twilioAccountSid: String!
    twilioAuthToken: String!
    twilioPhoneNumber: String!
    twilioEnabled: Boolean!
  }

  input VerificationConfigurationInput {
    skipEmailVerification: Boolean!
    skipMobileVerification: Boolean!
  }

  input CurrencyConfigurationInput {
    currency: String!
    currencySymbol: String!
  }

  type Configuration {
    _id: ID!
    email: String
    emailName: String
    password: String
    enableEmail: Boolean
    formEmail: String
    sendGridApiKey: String
    sendGridEnabled: Boolean
    sendGridEmail: String
    sendGridEmailName: String
    sendGridPassword: String
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    vapidKey: String
    dashboardSentryUrl: String
    webSentryUrl: String
    apiSentryUrl: String
    customerAppSentryUrl: String
    restaurantAppSentryUrl: String
    riderAppSentryUrl: String
    googleApiKey: String
    cloudinaryUploadUrl: String
    cloudinaryApiKey: String
    webAmplitudeApiKey: String
    appAmplitudeApiKey: String
    webClientID: String
    androidClientID: String
    iOSClientID: String
    expoClientID: String
    googleMapLibraries: String
    googleColor: String
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
    deliveryRate: Float
    costType: String
    clientId: String
    clientSecret: String
    sandbox: Boolean
    publishableKey: String
    secretKey: String
    twilioAccountSid: String
    twilioAuthToken: String
    twilioPhoneNumber: String
    twilioEnabled: Boolean
    skipEmailVerification: Boolean
    skipMobileVerification: Boolean
    currency: String
    currencySymbol: String
  }

  extend type Query {
    configuration: Configuration
  }

  extend type Mutation {
    saveEmailConfiguration(configurationInput: EmailConfigurationInput!): EmailConfiguration
    saveFormEmailConfiguration(configurationInput: FormEmailConfigurationInput!): FormEmailConfiguration
    saveSendGridConfiguration(configurationInput: SendGridConfigurationInput!): SendGridConfiguration
    saveFirebaseConfiguration(configurationInput: FirebaseConfigurationInput!): FirebaseConfiguration
    saveSentryConfiguration(configurationInput: SentryConfigurationInput!): SentryConfiguration
    saveGoogleApiKeyConfiguration(configurationInput: GoogleApiKeyConfigurationInput!): GoogleApiKeyConfiguration
    saveCloudinaryConfiguration(configurationInput: CloudinaryConfigurationInput!): CloudinaryConfiguration
    saveAmplitudeApiKeyConfiguration(configurationInput: AmplitudeApiKeyConfigurationInput!): AmplitudeApiKeyConfiguration
    saveGoogleClientIDConfiguration(configurationInput: GoogleClientIDConfigurationInput!): GoogleClientIDConfiguration
    saveWebConfiguration(configurationInput: WebConfigurationInput!): WebConfiguration
    saveAppConfigurations(configurationInput: AppConfigurationsInput!): AppConfigurations
    saveDeliveryRateConfiguration(configurationInput: DeliveryCostConfigurationInput!): DeliveryCostConfiguration
    savePaypalConfiguration(configurationInput: PaypalConfigurationInput!): PaypalConfiguration
    saveStripeConfiguration(configurationInput: StripeConfigurationInput!): StripeConfiguration
    saveTwilioConfiguration(configurationInput: TwilioConfigurationInput!): TwilioConfiguration
    saveVerificationsToggle(configurationInput: VerificationConfigurationInput!): VerificationConfiguration
    saveCurrencyConfiguration(configurationInput: CurrencyConfigurationInput!): CurrencyConfiguration
  }
`;