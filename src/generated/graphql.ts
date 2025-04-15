import { GraphQLResolveInfo } from 'graphql';
import { ConfigurationDocument } from '../models/Configuration';
import { UserDocument } from '../models/User';
import { RestaurantDocument } from '../models/Restaurant';
import { GraphQLContext } from '../types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Address = {
  __typename?: 'Address';
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
};

export type AddressInput = {
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInput>;
};

export type AmplitudeApiKeyConfiguration = {
  __typename?: 'AmplitudeApiKeyConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  appAmplitudeApiKey?: Maybe<Scalars['String']['output']>;
  webAmplitudeApiKey?: Maybe<Scalars['String']['output']>;
};

export type AmplitudeApiKeyConfigurationInput = {
  appAmplitudeApiKey: Scalars['String']['input'];
  webAmplitudeApiKey: Scalars['String']['input'];
};

export type AppConfigurations = {
  __typename?: 'AppConfigurations';
  _id?: Maybe<Scalars['ID']['output']>;
  privacyPolicy?: Maybe<Scalars['String']['output']>;
  termsAndConditions?: Maybe<Scalars['String']['output']>;
  testOtp?: Maybe<Scalars['String']['output']>;
};

export type AppConfigurationsInput = {
  privacyPolicy?: InputMaybe<Scalars['String']['input']>;
  termsAndConditions?: InputMaybe<Scalars['String']['input']>;
  testOtp?: InputMaybe<Scalars['String']['input']>;
};

export type BussinessDetails = {
  __typename?: 'BussinessDetails';
  registrationNumber?: Maybe<Scalars['String']['output']>;
  vatNumber?: Maybe<Scalars['String']['output']>;
};

export type BussinessDetailsInput = {
  registrationNumber?: InputMaybe<Scalars['String']['input']>;
  vatNumber?: InputMaybe<Scalars['String']['input']>;
};

export type CircleBounds = {
  __typename?: 'CircleBounds';
  center: Array<Scalars['Float']['output']>;
  radius: Scalars['Float']['output'];
};

export type CircleBoundsInput = {
  center: Array<Scalars['Float']['input']>;
  radius: Scalars['Float']['input'];
};

export type CloudinaryConfiguration = {
  __typename?: 'CloudinaryConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  cloudinaryApiKey?: Maybe<Scalars['String']['output']>;
  cloudinaryUploadUrl?: Maybe<Scalars['String']['output']>;
};

export type CloudinaryConfigurationInput = {
  cloudinaryApiKey: Scalars['String']['input'];
  cloudinaryUploadUrl: Scalars['String']['input'];
};

export type Configuration = {
  __typename?: 'Configuration';
  _id: Scalars['ID']['output'];
  androidClientID?: Maybe<Scalars['String']['output']>;
  apiSentryUrl?: Maybe<Scalars['String']['output']>;
  appAmplitudeApiKey?: Maybe<Scalars['String']['output']>;
  appId?: Maybe<Scalars['String']['output']>;
  authDomain?: Maybe<Scalars['String']['output']>;
  clientId?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  cloudinaryApiKey?: Maybe<Scalars['String']['output']>;
  cloudinaryUploadUrl?: Maybe<Scalars['String']['output']>;
  costType?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  currencySymbol?: Maybe<Scalars['String']['output']>;
  customerAppSentryUrl?: Maybe<Scalars['String']['output']>;
  dashboardSentryUrl?: Maybe<Scalars['String']['output']>;
  deliveryRate?: Maybe<Scalars['Float']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailName?: Maybe<Scalars['String']['output']>;
  enableEmail?: Maybe<Scalars['Boolean']['output']>;
  expoClientID?: Maybe<Scalars['String']['output']>;
  firebaseKey?: Maybe<Scalars['String']['output']>;
  formEmail?: Maybe<Scalars['String']['output']>;
  googleApiKey?: Maybe<Scalars['String']['output']>;
  googleColor?: Maybe<Scalars['String']['output']>;
  googleMapLibraries?: Maybe<Scalars['String']['output']>;
  iOSClientID?: Maybe<Scalars['String']['output']>;
  measurementId?: Maybe<Scalars['String']['output']>;
  msgSenderId?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  privacyPolicy?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  publishableKey?: Maybe<Scalars['String']['output']>;
  restaurantAppSentryUrl?: Maybe<Scalars['String']['output']>;
  riderAppSentryUrl?: Maybe<Scalars['String']['output']>;
  sandbox?: Maybe<Scalars['Boolean']['output']>;
  secretKey?: Maybe<Scalars['String']['output']>;
  sendGridApiKey?: Maybe<Scalars['String']['output']>;
  sendGridEmail?: Maybe<Scalars['String']['output']>;
  sendGridEmailName?: Maybe<Scalars['String']['output']>;
  sendGridEnabled?: Maybe<Scalars['Boolean']['output']>;
  sendGridPassword?: Maybe<Scalars['String']['output']>;
  skipEmailVerification?: Maybe<Scalars['Boolean']['output']>;
  skipMobileVerification?: Maybe<Scalars['Boolean']['output']>;
  storageBucket?: Maybe<Scalars['String']['output']>;
  termsAndConditions?: Maybe<Scalars['String']['output']>;
  testOtp?: Maybe<Scalars['String']['output']>;
  twilioAccountSid?: Maybe<Scalars['String']['output']>;
  twilioAuthToken?: Maybe<Scalars['String']['output']>;
  twilioEnabled?: Maybe<Scalars['Boolean']['output']>;
  twilioPhoneNumber?: Maybe<Scalars['String']['output']>;
  vapidKey?: Maybe<Scalars['String']['output']>;
  webAmplitudeApiKey?: Maybe<Scalars['String']['output']>;
  webClientID?: Maybe<Scalars['String']['output']>;
  webSentryUrl?: Maybe<Scalars['String']['output']>;
};

export type Coordinates = {
  __typename?: 'Coordinates';
  coordinates: Array<Scalars['Float']['output']>;
};

export type CoordinatesInput = {
  coordinates: Array<Scalars['Float']['input']>;
};

export type CurrencyConfiguration = {
  __typename?: 'CurrencyConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  currencySymbol?: Maybe<Scalars['String']['output']>;
};

export type CurrencyConfigurationInput = {
  currency: Scalars['String']['input'];
  currencySymbol: Scalars['String']['input'];
};

export type DeliveryBounds = {
  __typename?: 'DeliveryBounds';
  circle?: Maybe<CircleBounds>;
  coordinates?: Maybe<Array<Array<Array<Scalars['Float']['output']>>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type DeliveryCostConfiguration = {
  __typename?: 'DeliveryCostConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  costType?: Maybe<Scalars['String']['output']>;
  deliveryRate?: Maybe<Scalars['Float']['output']>;
};

export type DeliveryCostConfigurationInput = {
  costType: Scalars['String']['input'];
  deliveryRate: Scalars['Float']['input'];
};

export type EmailConfiguration = {
  __typename?: 'EmailConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailName?: Maybe<Scalars['String']['output']>;
  enableEmail?: Maybe<Scalars['Boolean']['output']>;
  password?: Maybe<Scalars['String']['output']>;
};

export type EmailConfigurationInput = {
  email: Scalars['String']['input'];
  emailName: Scalars['String']['input'];
  enableEmail: Scalars['Boolean']['input'];
  password: Scalars['String']['input'];
};

export type FirebaseConfiguration = {
  __typename?: 'FirebaseConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  appId?: Maybe<Scalars['String']['output']>;
  authDomain?: Maybe<Scalars['String']['output']>;
  firebaseKey?: Maybe<Scalars['String']['output']>;
  measurementId?: Maybe<Scalars['String']['output']>;
  msgSenderId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  storageBucket?: Maybe<Scalars['String']['output']>;
  vapidKey?: Maybe<Scalars['String']['output']>;
};

export type FirebaseConfigurationInput = {
  appId: Scalars['String']['input'];
  authDomain: Scalars['String']['input'];
  firebaseKey: Scalars['String']['input'];
  measurementId: Scalars['String']['input'];
  msgSenderId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  storageBucket: Scalars['String']['input'];
  vapidKey: Scalars['String']['input'];
};

export type FormEmailConfiguration = {
  __typename?: 'FormEmailConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  formEmail?: Maybe<Scalars['String']['output']>;
};

export type FormEmailConfigurationInput = {
  formEmail: Scalars['String']['input'];
};

export type GoogleApiKeyConfiguration = {
  __typename?: 'GoogleApiKeyConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  googleApiKey?: Maybe<Scalars['String']['output']>;
};

export type GoogleApiKeyConfigurationInput = {
  googleApiKey: Scalars['String']['input'];
};

export type GoogleClientIdConfiguration = {
  __typename?: 'GoogleClientIDConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  androidClientID?: Maybe<Scalars['String']['output']>;
  expoClientID?: Maybe<Scalars['String']['output']>;
  iOSClientID?: Maybe<Scalars['String']['output']>;
  webClientID?: Maybe<Scalars['String']['output']>;
};

export type GoogleClientIdConfigurationInput = {
  androidClientID: Scalars['String']['input'];
  expoClientID: Scalars['String']['input'];
  iOSClientID: Scalars['String']['input'];
  webClientID: Scalars['String']['input'];
};

export type Location = {
  __typename?: 'Location';
  coordinates: Array<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type LocationInput = {
  coordinates: Array<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  _?: Maybe<Scalars['String']['output']>;
  createRestaurant: Restaurant;
  createUser: User;
  deleteRestaurant?: Maybe<Restaurant>;
  deleteUser?: Maybe<User>;
  duplicateRestaurant: Restaurant;
  editRestaurant?: Maybe<Restaurant>;
  hardDeleteRestaurant: Scalars['Boolean']['output'];
  saveAmplitudeApiKeyConfiguration?: Maybe<AmplitudeApiKeyConfiguration>;
  saveAppConfigurations?: Maybe<AppConfigurations>;
  saveCloudinaryConfiguration?: Maybe<CloudinaryConfiguration>;
  saveCurrencyConfiguration?: Maybe<CurrencyConfiguration>;
  saveDeliveryRateConfiguration?: Maybe<DeliveryCostConfiguration>;
  saveEmailConfiguration?: Maybe<EmailConfiguration>;
  saveFirebaseConfiguration?: Maybe<FirebaseConfiguration>;
  saveFormEmailConfiguration?: Maybe<FormEmailConfiguration>;
  saveGoogleApiKeyConfiguration?: Maybe<GoogleApiKeyConfiguration>;
  saveGoogleClientIDConfiguration?: Maybe<GoogleClientIdConfiguration>;
  savePaypalConfiguration?: Maybe<PaypalConfiguration>;
  saveSendGridConfiguration?: Maybe<SendGridConfiguration>;
  saveSentryConfiguration?: Maybe<SentryConfiguration>;
  saveStripeConfiguration?: Maybe<StripeConfiguration>;
  saveTwilioConfiguration?: Maybe<TwilioConfiguration>;
  saveVerificationsToggle?: Maybe<VerificationConfiguration>;
  saveWebConfiguration?: Maybe<WebConfiguration>;
  updateDeliveryBoundsAndLocation: UpdateDeliveryBoundsAndLocationResult;
  updateFoodOutOfStock: Scalars['Boolean']['output'];
  updateRestaurantBussinessDetails: UpdateRestaurantBussinessDetailsResult;
  updateRestaurantDelivery: UpdateRestaurantDeliveryResult;
  updateUser?: Maybe<User>;
};


export type MutationCreateRestaurantArgs = {
  owner: Scalars['ID']['input'];
  restaurant: RestaurantInput;
};


export type MutationCreateUserArgs = {
  user: UserInput;
};


export type MutationDeleteRestaurantArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDuplicateRestaurantArgs = {
  id: Scalars['String']['input'];
  owner: Scalars['String']['input'];
};


export type MutationEditRestaurantArgs = {
  restaurant: RestaurantProfileInput;
};


export type MutationHardDeleteRestaurantArgs = {
  id: Scalars['String']['input'];
};


export type MutationSaveAmplitudeApiKeyConfigurationArgs = {
  configurationInput: AmplitudeApiKeyConfigurationInput;
};


export type MutationSaveAppConfigurationsArgs = {
  configurationInput: AppConfigurationsInput;
};


export type MutationSaveCloudinaryConfigurationArgs = {
  configurationInput: CloudinaryConfigurationInput;
};


export type MutationSaveCurrencyConfigurationArgs = {
  configurationInput: CurrencyConfigurationInput;
};


export type MutationSaveDeliveryRateConfigurationArgs = {
  configurationInput: DeliveryCostConfigurationInput;
};


export type MutationSaveEmailConfigurationArgs = {
  configurationInput: EmailConfigurationInput;
};


export type MutationSaveFirebaseConfigurationArgs = {
  configurationInput: FirebaseConfigurationInput;
};


export type MutationSaveFormEmailConfigurationArgs = {
  configurationInput: FormEmailConfigurationInput;
};


export type MutationSaveGoogleApiKeyConfigurationArgs = {
  configurationInput: GoogleApiKeyConfigurationInput;
};


export type MutationSaveGoogleClientIdConfigurationArgs = {
  configurationInput: GoogleClientIdConfigurationInput;
};


export type MutationSavePaypalConfigurationArgs = {
  configurationInput: PaypalConfigurationInput;
};


export type MutationSaveSendGridConfigurationArgs = {
  configurationInput: SendGridConfigurationInput;
};


export type MutationSaveSentryConfigurationArgs = {
  configurationInput: SentryConfigurationInput;
};


export type MutationSaveStripeConfigurationArgs = {
  configurationInput: StripeConfigurationInput;
};


export type MutationSaveTwilioConfigurationArgs = {
  configurationInput: TwilioConfigurationInput;
};


export type MutationSaveVerificationsToggleArgs = {
  configurationInput: VerificationConfigurationInput;
};


export type MutationSaveWebConfigurationArgs = {
  configurationInput: WebConfigurationInput;
};


export type MutationUpdateDeliveryBoundsAndLocationArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  boundType: Scalars['String']['input'];
  bounds?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Array<Scalars['Float']['input']>>>>>>;
  circleBounds?: InputMaybe<CircleBoundsInput>;
  city?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  location: CoordinatesInput;
  postCode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateFoodOutOfStockArgs = {
  categoryId: Scalars['String']['input'];
  id: Scalars['String']['input'];
  restaurant: Scalars['String']['input'];
};


export type MutationUpdateRestaurantBussinessDetailsArgs = {
  bussinessDetails?: InputMaybe<BussinessDetailsInput>;
  id: Scalars['String']['input'];
};


export type MutationUpdateRestaurantDeliveryArgs = {
  deliveryDistance?: InputMaybe<Scalars['Float']['input']>;
  deliveryFee?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  minDeliveryFee?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationUpdateUserArgs = {
  user: UserUpdateInput;
};

export type OpeningTime = {
  __typename?: 'OpeningTime';
  day: Scalars['String']['output'];
  times: Array<TimeRange>;
};

export type OpeningTimeInput = {
  day: Scalars['String']['input'];
  times: Array<TimeRangeInput>;
};

export type PaypalConfiguration = {
  __typename?: 'PaypalConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  clientId?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  sandbox?: Maybe<Scalars['Boolean']['output']>;
};

export type PaypalConfigurationInput = {
  clientId: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  sandbox: Scalars['Boolean']['input'];
};

export type Query = {
  __typename?: 'Query';
  _?: Maybe<Scalars['String']['output']>;
  configuration?: Maybe<Configuration>;
  getAllRestaurants?: Maybe<Array<Maybe<Restaurant>>>;
  getRider?: Maybe<Rider>;
  getRiders?: Maybe<Array<Maybe<Rider>>>;
  restaurant?: Maybe<Restaurant>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryGetRiderArgs = {
  id: Scalars['String']['input'];
};


export type QueryRestaurantArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Restaurant = {
  __typename?: 'Restaurant';
  _id: Scalars['ID']['output'];
  address?: Maybe<Scalars['String']['output']>;
  bussinessDetails?: Maybe<BussinessDetails>;
  commissionRate?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  cuisines?: Maybe<Array<Scalars['String']['output']>>;
  deliveryBounds?: Maybe<DeliveryBounds>;
  deliveryDistance?: Maybe<Scalars['Float']['output']>;
  deliveryFee?: Maybe<Scalars['Float']['output']>;
  deliveryTime?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isAvailable?: Maybe<Scalars['Boolean']['output']>;
  location: Location;
  logo?: Maybe<Scalars['String']['output']>;
  minDeliveryFee?: Maybe<Scalars['Float']['output']>;
  minimumOrder?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  openingTimes?: Maybe<Array<OpeningTime>>;
  orderId?: Maybe<Scalars['Int']['output']>;
  orderPrefix?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<User>;
  phone?: Maybe<Scalars['String']['output']>;
  shopType?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type RestaurantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  commissionRate?: InputMaybe<Scalars['Float']['input']>;
  cuisines?: InputMaybe<Array<Scalars['String']['input']>>;
  deliveryTime?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location: CoordinatesInput;
  logo?: InputMaybe<Scalars['String']['input']>;
  minimumOrder?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  orderId?: InputMaybe<Scalars['Int']['input']>;
  orderPrefix?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  shopType?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['Float']['input']>;
  username: Scalars['String']['input'];
};

export type RestaurantProfileInput = {
  _id: Scalars['ID']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<CoordinatesInput>;
  logo?: InputMaybe<Scalars['String']['input']>;
  minimumOrder?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingTimes?: InputMaybe<Array<OpeningTimeInput>>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  orderPrefix?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  shopType?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['Float']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Rider = {
  __typename?: 'Rider';
  _id?: Maybe<Scalars['ID']['output']>;
  available?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Location>;
  name?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type RiderUpdatePayload = {
  __typename?: 'RiderUpdatePayload';
  _id?: Maybe<Scalars['ID']['output']>;
};

export type SendGridConfiguration = {
  __typename?: 'SendGridConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  sendGridApiKey?: Maybe<Scalars['String']['output']>;
  sendGridEmail?: Maybe<Scalars['String']['output']>;
  sendGridEmailName?: Maybe<Scalars['String']['output']>;
  sendGridEnabled?: Maybe<Scalars['Boolean']['output']>;
  sendGridPassword?: Maybe<Scalars['String']['output']>;
};

export type SendGridConfigurationInput = {
  sendGridApiKey: Scalars['String']['input'];
  sendGridEmail: Scalars['String']['input'];
  sendGridEmailName: Scalars['String']['input'];
  sendGridEnabled: Scalars['Boolean']['input'];
  sendGridPassword: Scalars['String']['input'];
};

export type SentryConfiguration = {
  __typename?: 'SentryConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  apiSentryUrl?: Maybe<Scalars['String']['output']>;
  customerAppSentryUrl?: Maybe<Scalars['String']['output']>;
  dashboardSentryUrl?: Maybe<Scalars['String']['output']>;
  restaurantAppSentryUrl?: Maybe<Scalars['String']['output']>;
  riderAppSentryUrl?: Maybe<Scalars['String']['output']>;
  webSentryUrl?: Maybe<Scalars['String']['output']>;
};

export type SentryConfigurationInput = {
  apiSentryUrl: Scalars['String']['input'];
  customerAppSentryUrl: Scalars['String']['input'];
  dashboardSentryUrl: Scalars['String']['input'];
  restaurantAppSentryUrl: Scalars['String']['input'];
  riderAppSentryUrl: Scalars['String']['input'];
  webSentryUrl: Scalars['String']['input'];
};

export type StripeConfiguration = {
  __typename?: 'StripeConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  publishableKey?: Maybe<Scalars['String']['output']>;
  secretKey?: Maybe<Scalars['String']['output']>;
};

export type StripeConfigurationInput = {
  publishableKey: Scalars['String']['input'];
  secretKey: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _?: Maybe<Scalars['String']['output']>;
  riderUpdated?: Maybe<RiderUpdatePayload>;
};

export type TimeRange = {
  __typename?: 'TimeRange';
  endTime: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
};

export type TimeRangeInput = {
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

export type TwilioConfiguration = {
  __typename?: 'TwilioConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  twilioAccountSid?: Maybe<Scalars['String']['output']>;
  twilioAuthToken?: Maybe<Scalars['String']['output']>;
  twilioEnabled?: Maybe<Scalars['Boolean']['output']>;
  twilioPhoneNumber?: Maybe<Scalars['String']['output']>;
};

export type TwilioConfigurationInput = {
  twilioAccountSid: Scalars['String']['input'];
  twilioAuthToken: Scalars['String']['input'];
  twilioEnabled: Scalars['Boolean']['input'];
  twilioPhoneNumber: Scalars['String']['input'];
};

export type UpdateDeliveryBoundsAndLocationResult = {
  __typename?: 'UpdateDeliveryBoundsAndLocationResult';
  data?: Maybe<Restaurant>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type UpdateRestaurantBussinessDetailsResult = {
  __typename?: 'UpdateRestaurantBussinessDetailsResult';
  data?: Maybe<Restaurant>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type UpdateRestaurantDeliveryResult = {
  __typename?: 'UpdateRestaurantDeliveryResult';
  data?: Maybe<Restaurant>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  addresses?: Maybe<Array<Address>>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type UserInput = {
  addresses?: InputMaybe<Array<AddressInput>>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type UserUpdateInput = {
  _id: Scalars['ID']['input'];
  addresses?: InputMaybe<Array<AddressInput>>;
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type VerificationConfiguration = {
  __typename?: 'VerificationConfiguration';
  skipEmailVerification?: Maybe<Scalars['Boolean']['output']>;
  skipMobileVerification?: Maybe<Scalars['Boolean']['output']>;
};

export type VerificationConfigurationInput = {
  skipEmailVerification: Scalars['Boolean']['input'];
  skipMobileVerification: Scalars['Boolean']['input'];
};

export type WebConfiguration = {
  __typename?: 'WebConfiguration';
  _id?: Maybe<Scalars['ID']['output']>;
  googleColor?: Maybe<Scalars['String']['output']>;
  googleMapLibraries?: Maybe<Scalars['String']['output']>;
};

export type WebConfigurationInput = {
  googleColor?: InputMaybe<Scalars['String']['input']>;
  googleMapLibraries?: InputMaybe<Scalars['String']['input']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
  AmplitudeApiKeyConfiguration: ResolverTypeWrapper<AmplitudeApiKeyConfiguration>;
  AmplitudeApiKeyConfigurationInput: AmplitudeApiKeyConfigurationInput;
  AppConfigurations: ResolverTypeWrapper<AppConfigurations>;
  AppConfigurationsInput: AppConfigurationsInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BussinessDetails: ResolverTypeWrapper<BussinessDetails>;
  BussinessDetailsInput: BussinessDetailsInput;
  CircleBounds: ResolverTypeWrapper<CircleBounds>;
  CircleBoundsInput: CircleBoundsInput;
  CloudinaryConfiguration: ResolverTypeWrapper<CloudinaryConfiguration>;
  CloudinaryConfigurationInput: CloudinaryConfigurationInput;
  Configuration: ResolverTypeWrapper<ConfigurationDocument>;
  Coordinates: ResolverTypeWrapper<Coordinates>;
  CoordinatesInput: CoordinatesInput;
  CurrencyConfiguration: ResolverTypeWrapper<CurrencyConfiguration>;
  CurrencyConfigurationInput: CurrencyConfigurationInput;
  DeliveryBounds: ResolverTypeWrapper<DeliveryBounds>;
  DeliveryCostConfiguration: ResolverTypeWrapper<DeliveryCostConfiguration>;
  DeliveryCostConfigurationInput: DeliveryCostConfigurationInput;
  EmailConfiguration: ResolverTypeWrapper<EmailConfiguration>;
  EmailConfigurationInput: EmailConfigurationInput;
  FirebaseConfiguration: ResolverTypeWrapper<FirebaseConfiguration>;
  FirebaseConfigurationInput: FirebaseConfigurationInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FormEmailConfiguration: ResolverTypeWrapper<FormEmailConfiguration>;
  FormEmailConfigurationInput: FormEmailConfigurationInput;
  GoogleApiKeyConfiguration: ResolverTypeWrapper<GoogleApiKeyConfiguration>;
  GoogleApiKeyConfigurationInput: GoogleApiKeyConfigurationInput;
  GoogleClientIDConfiguration: ResolverTypeWrapper<GoogleClientIdConfiguration>;
  GoogleClientIDConfigurationInput: GoogleClientIdConfigurationInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Location: ResolverTypeWrapper<Location>;
  LocationInput: LocationInput;
  Mutation: ResolverTypeWrapper<{}>;
  OpeningTime: ResolverTypeWrapper<OpeningTime>;
  OpeningTimeInput: OpeningTimeInput;
  PaypalConfiguration: ResolverTypeWrapper<PaypalConfiguration>;
  PaypalConfigurationInput: PaypalConfigurationInput;
  Query: ResolverTypeWrapper<{}>;
  Restaurant: ResolverTypeWrapper<RestaurantDocument>;
  RestaurantInput: RestaurantInput;
  RestaurantProfileInput: RestaurantProfileInput;
  Rider: ResolverTypeWrapper<Rider>;
  RiderUpdatePayload: ResolverTypeWrapper<RiderUpdatePayload>;
  SendGridConfiguration: ResolverTypeWrapper<SendGridConfiguration>;
  SendGridConfigurationInput: SendGridConfigurationInput;
  SentryConfiguration: ResolverTypeWrapper<SentryConfiguration>;
  SentryConfigurationInput: SentryConfigurationInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StripeConfiguration: ResolverTypeWrapper<StripeConfiguration>;
  StripeConfigurationInput: StripeConfigurationInput;
  Subscription: ResolverTypeWrapper<{}>;
  TimeRange: ResolverTypeWrapper<TimeRange>;
  TimeRangeInput: TimeRangeInput;
  TwilioConfiguration: ResolverTypeWrapper<TwilioConfiguration>;
  TwilioConfigurationInput: TwilioConfigurationInput;
  UpdateDeliveryBoundsAndLocationResult: ResolverTypeWrapper<Omit<UpdateDeliveryBoundsAndLocationResult, 'data'> & { data?: Maybe<ResolversTypes['Restaurant']> }>;
  UpdateRestaurantBussinessDetailsResult: ResolverTypeWrapper<Omit<UpdateRestaurantBussinessDetailsResult, 'data'> & { data?: Maybe<ResolversTypes['Restaurant']> }>;
  UpdateRestaurantDeliveryResult: ResolverTypeWrapper<Omit<UpdateRestaurantDeliveryResult, 'data'> & { data?: Maybe<ResolversTypes['Restaurant']> }>;
  User: ResolverTypeWrapper<UserDocument>;
  UserInput: UserInput;
  UserUpdateInput: UserUpdateInput;
  VerificationConfiguration: ResolverTypeWrapper<VerificationConfiguration>;
  VerificationConfigurationInput: VerificationConfigurationInput;
  WebConfiguration: ResolverTypeWrapper<WebConfiguration>;
  WebConfigurationInput: WebConfigurationInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Address: Address;
  AddressInput: AddressInput;
  AmplitudeApiKeyConfiguration: AmplitudeApiKeyConfiguration;
  AmplitudeApiKeyConfigurationInput: AmplitudeApiKeyConfigurationInput;
  AppConfigurations: AppConfigurations;
  AppConfigurationsInput: AppConfigurationsInput;
  Boolean: Scalars['Boolean']['output'];
  BussinessDetails: BussinessDetails;
  BussinessDetailsInput: BussinessDetailsInput;
  CircleBounds: CircleBounds;
  CircleBoundsInput: CircleBoundsInput;
  CloudinaryConfiguration: CloudinaryConfiguration;
  CloudinaryConfigurationInput: CloudinaryConfigurationInput;
  Configuration: ConfigurationDocument;
  Coordinates: Coordinates;
  CoordinatesInput: CoordinatesInput;
  CurrencyConfiguration: CurrencyConfiguration;
  CurrencyConfigurationInput: CurrencyConfigurationInput;
  DeliveryBounds: DeliveryBounds;
  DeliveryCostConfiguration: DeliveryCostConfiguration;
  DeliveryCostConfigurationInput: DeliveryCostConfigurationInput;
  EmailConfiguration: EmailConfiguration;
  EmailConfigurationInput: EmailConfigurationInput;
  FirebaseConfiguration: FirebaseConfiguration;
  FirebaseConfigurationInput: FirebaseConfigurationInput;
  Float: Scalars['Float']['output'];
  FormEmailConfiguration: FormEmailConfiguration;
  FormEmailConfigurationInput: FormEmailConfigurationInput;
  GoogleApiKeyConfiguration: GoogleApiKeyConfiguration;
  GoogleApiKeyConfigurationInput: GoogleApiKeyConfigurationInput;
  GoogleClientIDConfiguration: GoogleClientIdConfiguration;
  GoogleClientIDConfigurationInput: GoogleClientIdConfigurationInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Location: Location;
  LocationInput: LocationInput;
  Mutation: {};
  OpeningTime: OpeningTime;
  OpeningTimeInput: OpeningTimeInput;
  PaypalConfiguration: PaypalConfiguration;
  PaypalConfigurationInput: PaypalConfigurationInput;
  Query: {};
  Restaurant: RestaurantDocument;
  RestaurantInput: RestaurantInput;
  RestaurantProfileInput: RestaurantProfileInput;
  Rider: Rider;
  RiderUpdatePayload: RiderUpdatePayload;
  SendGridConfiguration: SendGridConfiguration;
  SendGridConfigurationInput: SendGridConfigurationInput;
  SentryConfiguration: SentryConfiguration;
  SentryConfigurationInput: SentryConfigurationInput;
  String: Scalars['String']['output'];
  StripeConfiguration: StripeConfiguration;
  StripeConfigurationInput: StripeConfigurationInput;
  Subscription: {};
  TimeRange: TimeRange;
  TimeRangeInput: TimeRangeInput;
  TwilioConfiguration: TwilioConfiguration;
  TwilioConfigurationInput: TwilioConfigurationInput;
  UpdateDeliveryBoundsAndLocationResult: Omit<UpdateDeliveryBoundsAndLocationResult, 'data'> & { data?: Maybe<ResolversParentTypes['Restaurant']> };
  UpdateRestaurantBussinessDetailsResult: Omit<UpdateRestaurantBussinessDetailsResult, 'data'> & { data?: Maybe<ResolversParentTypes['Restaurant']> };
  UpdateRestaurantDeliveryResult: Omit<UpdateRestaurantDeliveryResult, 'data'> & { data?: Maybe<ResolversParentTypes['Restaurant']> };
  User: UserDocument;
  UserInput: UserInput;
  UserUpdateInput: UserUpdateInput;
  VerificationConfiguration: VerificationConfiguration;
  VerificationConfigurationInput: VerificationConfigurationInput;
  WebConfiguration: WebConfiguration;
  WebConfigurationInput: WebConfigurationInput;
}>;

export type AddressResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = ResolversObject<{
  deliveryAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AmplitudeApiKeyConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AmplitudeApiKeyConfiguration'] = ResolversParentTypes['AmplitudeApiKeyConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  appAmplitudeApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webAmplitudeApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AppConfigurationsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AppConfigurations'] = ResolversParentTypes['AppConfigurations']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  privacyPolicy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  termsAndConditions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  testOtp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BussinessDetailsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BussinessDetails'] = ResolversParentTypes['BussinessDetails']> = ResolversObject<{
  registrationNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vatNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CircleBoundsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CircleBounds'] = ResolversParentTypes['CircleBounds']> = ResolversObject<{
  center?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  radius?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CloudinaryConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CloudinaryConfiguration'] = ResolversParentTypes['CloudinaryConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  cloudinaryApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cloudinaryUploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Configuration'] = ResolversParentTypes['Configuration']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  androidClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  apiSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  appAmplitudeApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  appId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authDomain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cloudinaryApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cloudinaryUploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  costType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currencySymbol?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dashboardSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deliveryRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enableEmail?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  expoClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firebaseKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  formEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  googleApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  googleColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  googleMapLibraries?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  iOSClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  measurementId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msgSenderId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  privacyPolicy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publishableKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  restaurantAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  riderAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sandbox?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  secretKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEmailName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  sendGridPassword?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  skipEmailVerification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  skipMobileVerification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  storageBucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  termsAndConditions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  testOtp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twilioAccountSid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twilioAuthToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twilioEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  twilioPhoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vapidKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webAmplitudeApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CoordinatesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Coordinates'] = ResolversParentTypes['Coordinates']> = ResolversObject<{
  coordinates?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CurrencyConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CurrencyConfiguration'] = ResolversParentTypes['CurrencyConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currencySymbol?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeliveryBoundsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DeliveryBounds'] = ResolversParentTypes['DeliveryBounds']> = ResolversObject<{
  circle?: Resolver<Maybe<ResolversTypes['CircleBounds']>, ParentType, ContextType>;
  coordinates?: Resolver<Maybe<Array<Array<Array<ResolversTypes['Float']>>>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeliveryCostConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DeliveryCostConfiguration'] = ResolversParentTypes['DeliveryCostConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  costType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deliveryRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EmailConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EmailConfiguration'] = ResolversParentTypes['EmailConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enableEmail?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FirebaseConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FirebaseConfiguration'] = ResolversParentTypes['FirebaseConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  appId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authDomain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firebaseKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  measurementId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msgSenderId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  storageBucket?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vapidKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FormEmailConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FormEmailConfiguration'] = ResolversParentTypes['FormEmailConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  formEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoogleApiKeyConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoogleApiKeyConfiguration'] = ResolversParentTypes['GoogleApiKeyConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  googleApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoogleClientIdConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoogleClientIDConfiguration'] = ResolversParentTypes['GoogleClientIDConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  androidClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expoClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  iOSClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webClientID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  coordinates?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createRestaurant?: Resolver<ResolversTypes['Restaurant'], ParentType, ContextType, RequireFields<MutationCreateRestaurantArgs, 'owner' | 'restaurant'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'user'>>;
  deleteRestaurant?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType, RequireFields<MutationDeleteRestaurantArgs, 'id'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  duplicateRestaurant?: Resolver<ResolversTypes['Restaurant'], ParentType, ContextType, RequireFields<MutationDuplicateRestaurantArgs, 'id' | 'owner'>>;
  editRestaurant?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType, RequireFields<MutationEditRestaurantArgs, 'restaurant'>>;
  hardDeleteRestaurant?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationHardDeleteRestaurantArgs, 'id'>>;
  saveAmplitudeApiKeyConfiguration?: Resolver<Maybe<ResolversTypes['AmplitudeApiKeyConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveAmplitudeApiKeyConfigurationArgs, 'configurationInput'>>;
  saveAppConfigurations?: Resolver<Maybe<ResolversTypes['AppConfigurations']>, ParentType, ContextType, RequireFields<MutationSaveAppConfigurationsArgs, 'configurationInput'>>;
  saveCloudinaryConfiguration?: Resolver<Maybe<ResolversTypes['CloudinaryConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveCloudinaryConfigurationArgs, 'configurationInput'>>;
  saveCurrencyConfiguration?: Resolver<Maybe<ResolversTypes['CurrencyConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveCurrencyConfigurationArgs, 'configurationInput'>>;
  saveDeliveryRateConfiguration?: Resolver<Maybe<ResolversTypes['DeliveryCostConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveDeliveryRateConfigurationArgs, 'configurationInput'>>;
  saveEmailConfiguration?: Resolver<Maybe<ResolversTypes['EmailConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveEmailConfigurationArgs, 'configurationInput'>>;
  saveFirebaseConfiguration?: Resolver<Maybe<ResolversTypes['FirebaseConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveFirebaseConfigurationArgs, 'configurationInput'>>;
  saveFormEmailConfiguration?: Resolver<Maybe<ResolversTypes['FormEmailConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveFormEmailConfigurationArgs, 'configurationInput'>>;
  saveGoogleApiKeyConfiguration?: Resolver<Maybe<ResolversTypes['GoogleApiKeyConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveGoogleApiKeyConfigurationArgs, 'configurationInput'>>;
  saveGoogleClientIDConfiguration?: Resolver<Maybe<ResolversTypes['GoogleClientIDConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveGoogleClientIdConfigurationArgs, 'configurationInput'>>;
  savePaypalConfiguration?: Resolver<Maybe<ResolversTypes['PaypalConfiguration']>, ParentType, ContextType, RequireFields<MutationSavePaypalConfigurationArgs, 'configurationInput'>>;
  saveSendGridConfiguration?: Resolver<Maybe<ResolversTypes['SendGridConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveSendGridConfigurationArgs, 'configurationInput'>>;
  saveSentryConfiguration?: Resolver<Maybe<ResolversTypes['SentryConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveSentryConfigurationArgs, 'configurationInput'>>;
  saveStripeConfiguration?: Resolver<Maybe<ResolversTypes['StripeConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveStripeConfigurationArgs, 'configurationInput'>>;
  saveTwilioConfiguration?: Resolver<Maybe<ResolversTypes['TwilioConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveTwilioConfigurationArgs, 'configurationInput'>>;
  saveVerificationsToggle?: Resolver<Maybe<ResolversTypes['VerificationConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveVerificationsToggleArgs, 'configurationInput'>>;
  saveWebConfiguration?: Resolver<Maybe<ResolversTypes['WebConfiguration']>, ParentType, ContextType, RequireFields<MutationSaveWebConfigurationArgs, 'configurationInput'>>;
  updateDeliveryBoundsAndLocation?: Resolver<ResolversTypes['UpdateDeliveryBoundsAndLocationResult'], ParentType, ContextType, RequireFields<MutationUpdateDeliveryBoundsAndLocationArgs, 'boundType' | 'id' | 'location'>>;
  updateFoodOutOfStock?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUpdateFoodOutOfStockArgs, 'categoryId' | 'id' | 'restaurant'>>;
  updateRestaurantBussinessDetails?: Resolver<ResolversTypes['UpdateRestaurantBussinessDetailsResult'], ParentType, ContextType, RequireFields<MutationUpdateRestaurantBussinessDetailsArgs, 'id'>>;
  updateRestaurantDelivery?: Resolver<ResolversTypes['UpdateRestaurantDeliveryResult'], ParentType, ContextType, RequireFields<MutationUpdateRestaurantDeliveryArgs, 'id'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'user'>>;
}>;

export type OpeningTimeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OpeningTime'] = ResolversParentTypes['OpeningTime']> = ResolversObject<{
  day?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  times?: Resolver<Array<ResolversTypes['TimeRange']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaypalConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaypalConfiguration'] = ResolversParentTypes['PaypalConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  clientId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sandbox?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  configuration?: Resolver<Maybe<ResolversTypes['Configuration']>, ParentType, ContextType>;
  getAllRestaurants?: Resolver<Maybe<Array<Maybe<ResolversTypes['Restaurant']>>>, ParentType, ContextType>;
  getRider?: Resolver<Maybe<ResolversTypes['Rider']>, ParentType, ContextType, RequireFields<QueryGetRiderArgs, 'id'>>;
  getRiders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Rider']>>>, ParentType, ContextType>;
  restaurant?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType, Partial<QueryRestaurantArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type RestaurantResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Restaurant'] = ResolversParentTypes['Restaurant']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bussinessDetails?: Resolver<Maybe<ResolversTypes['BussinessDetails']>, ParentType, ContextType>;
  commissionRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cuisines?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  deliveryBounds?: Resolver<Maybe<ResolversTypes['DeliveryBounds']>, ParentType, ContextType>;
  deliveryDistance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deliveryFee?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deliveryTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isAvailable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  location?: Resolver<ResolversTypes['Location'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minDeliveryFee?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minimumOrder?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  openingTimes?: Resolver<Maybe<Array<ResolversTypes['OpeningTime']>>, ParentType, ContextType>;
  orderId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orderPrefix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shopType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tax?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RiderResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Rider'] = ResolversParentTypes['Rider']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  available?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RiderUpdatePayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RiderUpdatePayload'] = ResolversParentTypes['RiderUpdatePayload']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SendGridConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SendGridConfiguration'] = ResolversParentTypes['SendGridConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  sendGridApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEmailName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sendGridEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  sendGridPassword?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SentryConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SentryConfiguration'] = ResolversParentTypes['SentryConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  apiSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dashboardSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  restaurantAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  riderAppSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webSentryUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StripeConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StripeConfiguration'] = ResolversParentTypes['StripeConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  publishableKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secretKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  _?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "_", ParentType, ContextType>;
  riderUpdated?: SubscriptionResolver<Maybe<ResolversTypes['RiderUpdatePayload']>, "riderUpdated", ParentType, ContextType>;
}>;

export type TimeRangeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TimeRange'] = ResolversParentTypes['TimeRange']> = ResolversObject<{
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TwilioConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TwilioConfiguration'] = ResolversParentTypes['TwilioConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  twilioAccountSid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twilioAuthToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twilioEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  twilioPhoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateDeliveryBoundsAndLocationResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UpdateDeliveryBoundsAndLocationResult'] = ResolversParentTypes['UpdateDeliveryBoundsAndLocationResult']> = ResolversObject<{
  data?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateRestaurantBussinessDetailsResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UpdateRestaurantBussinessDetailsResult'] = ResolversParentTypes['UpdateRestaurantBussinessDetailsResult']> = ResolversObject<{
  data?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateRestaurantDeliveryResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UpdateRestaurantDeliveryResult'] = ResolversParentTypes['UpdateRestaurantDeliveryResult']> = ResolversObject<{
  data?: Resolver<Maybe<ResolversTypes['Restaurant']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  addresses?: Resolver<Maybe<Array<ResolversTypes['Address']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerificationConfiguration'] = ResolversParentTypes['VerificationConfiguration']> = ResolversObject<{
  skipEmailVerification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  skipMobileVerification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WebConfigurationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WebConfiguration'] = ResolversParentTypes['WebConfiguration']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  googleColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  googleMapLibraries?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Address?: AddressResolvers<ContextType>;
  AmplitudeApiKeyConfiguration?: AmplitudeApiKeyConfigurationResolvers<ContextType>;
  AppConfigurations?: AppConfigurationsResolvers<ContextType>;
  BussinessDetails?: BussinessDetailsResolvers<ContextType>;
  CircleBounds?: CircleBoundsResolvers<ContextType>;
  CloudinaryConfiguration?: CloudinaryConfigurationResolvers<ContextType>;
  Configuration?: ConfigurationResolvers<ContextType>;
  Coordinates?: CoordinatesResolvers<ContextType>;
  CurrencyConfiguration?: CurrencyConfigurationResolvers<ContextType>;
  DeliveryBounds?: DeliveryBoundsResolvers<ContextType>;
  DeliveryCostConfiguration?: DeliveryCostConfigurationResolvers<ContextType>;
  EmailConfiguration?: EmailConfigurationResolvers<ContextType>;
  FirebaseConfiguration?: FirebaseConfigurationResolvers<ContextType>;
  FormEmailConfiguration?: FormEmailConfigurationResolvers<ContextType>;
  GoogleApiKeyConfiguration?: GoogleApiKeyConfigurationResolvers<ContextType>;
  GoogleClientIDConfiguration?: GoogleClientIdConfigurationResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OpeningTime?: OpeningTimeResolvers<ContextType>;
  PaypalConfiguration?: PaypalConfigurationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Restaurant?: RestaurantResolvers<ContextType>;
  Rider?: RiderResolvers<ContextType>;
  RiderUpdatePayload?: RiderUpdatePayloadResolvers<ContextType>;
  SendGridConfiguration?: SendGridConfigurationResolvers<ContextType>;
  SentryConfiguration?: SentryConfigurationResolvers<ContextType>;
  StripeConfiguration?: StripeConfigurationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TimeRange?: TimeRangeResolvers<ContextType>;
  TwilioConfiguration?: TwilioConfigurationResolvers<ContextType>;
  UpdateDeliveryBoundsAndLocationResult?: UpdateDeliveryBoundsAndLocationResultResolvers<ContextType>;
  UpdateRestaurantBussinessDetailsResult?: UpdateRestaurantBussinessDetailsResultResolvers<ContextType>;
  UpdateRestaurantDeliveryResult?: UpdateRestaurantDeliveryResultResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  VerificationConfiguration?: VerificationConfigurationResolvers<ContextType>;
  WebConfiguration?: WebConfigurationResolvers<ContextType>;
}>;

