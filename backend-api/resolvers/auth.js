const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const Owner = require('../models/owner');
const Reset = require('../models/reset');
const Rider = require('../models/rider');
const { transformUser, transformOwner } = require('./merge');
const { sendEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../helpers/email');
const templates = require('../helpers/templates');
const restaurant = require('../models/restaurant');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'customsecretkey';

module.exports = {
  Mutation: {
    createOwner: async (_, { input }) => {
      try {
        const { name, email, password, phone, image } = input;

        // 1. Check if the email is already taken
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
          throw new Error('Email is already taken');
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Create the new owner
        const newOwner = new Owner({
          name,
          email,
          password: hashedPassword,
          phone,
          image,
          userType: 'owner', // Set the userType
          permissions: [],  // Initialize permissions
          restaurants: [],
          isActive: true,
        });

        // 4. Save the owner to the database
        const savedOwner = await newOwner.save();

        // 5.  Return the new owner data (you might want to exclude the password)
        return {
          userId: savedOwner.id,
          email: savedOwner.email,
          userType: savedOwner.userType,
          name: savedOwner.name,
          phone: savedOwner.phone,
          image: savedOwner.image,
          permissions: savedOwner.permissions,
        };
      } catch (error) {
        console.error('Error creating owner:', error);
        throw new Error(`Failed to create owner: ${error.message}`); // Improved error message
      }
    },
    ownerLogin: async (_, { email, password }) => {
      console.log('Owner login');
      try {
        const owner = await Owner.findOne({ email });
        if (!owner) {
          throw new Error('User does not exist');
        }
    
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }
    
        const userType = owner.userType ? String(owner.userType).toUpperCase() : 'ADMIN';
    
        const token = jwt.sign(
          {
            userId: owner.id,
            email: owner.email,
            userType: userType,
          },
          JWT_SECRET
        );
    
        const restaurants = await restaurant.find({ _id: { $in: owner.restaurants || [] } });
    
        console.log("Logged in owner userType:", userType);
    
        return {
          userId: owner.id,
          token,
          email: owner.email,
          userType: userType,
          restaurants: restaurants || [],
          permissions: owner.permissions || [],
          userTypeId: owner.id,
          image: owner.image || null,
          name: owner.name,
        };
      } catch (error) {
        console.error('Owner login error:', error);
        throw new Error(`Login failed: ${error.message}`);
      }
    },

    vendorResetPassword: async (_, { oldPassword, newPassword }, { req }) => {
      console.log('Vendor resetting password');
      if (!req.isAuth) throw new Error('Unauthenticated');

      try {
        const owner = await Owner.findById(req.userId);
        if (!owner) throw new Error('Owner not found. Contact Support!');

        const isMatch = await bcrypt.compare(oldPassword, owner.password);
        if (!isMatch) throw new Error('Invalid credentials');

        owner.password = await bcrypt.hash(newPassword, 12);
        await owner.save();
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    login: async (_, { appleId, email, password, type, name, notificationToken }) => {
      console.log('User login', { appleId, email, password, type, notificationToken });

      let isNewUser = false;
      let user = appleId ? await User.findOne({ appleId }) : await User.findOne({ email });

      if (!user) {
        if (appleId || type === 'google') {
          isNewUser = true;
          user = new User({
            appleId,
            email,
            name,
            notificationToken,
            isOrderNotification: !!notificationToken,
            isOfferNotification: !!notificationToken,
            userType: appleId ? 'apple' : 'google',
            emailIsVerified: true,
          });
        } else {
          user = await User.findOne({ phone: email });
          if (!user) throw new Error('User does not exist');
        }
      }

      if (type === 'default' && !await bcrypt.compare(password, user.password)) {
        throw new Error('Invalid credentials');
      }

      user.notificationToken = notificationToken;
      await user.save();

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email || user.appleId,
        },
        JWT_SECRET
      );

      if (isNewUser) {
        // const attachment = path.join(__dirname, '../../public/assets/tempImages/enatega.png');
        const attachment = 'https://res.cloudinary.com/dzdohbv3s/image/upload/v1745357465/cdmlathwtjtub8ko5z3q.jpg';
        const signupTemp = await templates.signupTemplate({ name: user.name, email: user.email });
        sendEmail(user.email, 'Account Creation', '', signupTemp, attachment);
      }

      return {
        ...user._doc,
        email: user.email || user.appleId,
        userId: user.id,
        token,
        tokenExpiration: 1,
        isNewUser,
      };
    },

    riderLogin: async (_, { username, password, notificationToken }) => {
      console.log('Rider login', username);

      const rider = await Rider.findOne({ username });
      if (!rider || rider.password !== password) throw new Error('Invalid credentials');

      rider.notificationToken = notificationToken;
      await rider.save();

      const token = jwt.sign(
        { userId: rider.id, email: rider.username },
        JWT_SECRET
      );

      return {
        ...rider._doc,
        email: rider.username,
        password: '',
        userId: rider.id,
        token,
        tokenExpiration: 1,
      };
    },

    pushToken: async (_, { token }, { req }) => {
      if (!req.isAuth) throw new Error('Unauthenticated');
      console.log('Updating push token:', token);

      try {
        const user = await User.findById(req.userId);
        user.notificationToken = token;
        await user.save();

        return transformUser(user);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    forgotPassword: async (_, { email, otp }) => {
      console.log('Forgot password for:', email);

      const user = await User.findOne({ email });
      if (!user) throw new Error('User does not exist');

      const token = uuidv4();
      const reset = new Reset({ user: user.id, token });
      await reset.save();

      const resetPasswordTemp = await templates.resetPasswordTemplate(otp);
      const resetPasswordTxt = templates.resetPasswordText(otp);
      // const attachment = path.join(__dirname, '../../public/assets/tempImages/enatega.png');
      const attachment = 'https://res.cloudinary.com/dzdohbv3s/image/upload/v1745357465/cdmlathwtjtub8ko5z3q.jpg';

      sendEmail(user.email, 'Forgot Password', resetPasswordTxt, resetPasswordTemp, attachment);

      return { result: true };
    },

    resetPassword: async (_, { password, email }) => {
      console.log('Resetting password for:', email);

      const user = await User.findOne({ email });
      if (!user) throw new Error('Something went wrong. Please try again later');

      user.password = await bcrypt.hash(password, 12);
      await user.save();

      return { result: true };
    },

    changePassword: async (_, { oldPassword, newPassword }, { req }) => {
      console.log('Changing password');
      if (!req.isAuth) throw new Error('Unauthenticated');

      try {
        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    uploadToken: async (_, { id, pushToken }) => {
      console.log('Uploading push token for user:', id);

      const owner = await Owner.findById(id);
      if (!owner) throw new Error('User not found');

      owner.pushToken = pushToken;
      const updatedOwner = await owner.save();

      return {
        ...updatedOwner._doc,
        _id: updatedOwner.id,
      };
    },
  },
};
