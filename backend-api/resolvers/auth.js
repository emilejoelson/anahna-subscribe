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

module.exports = {
  Mutation: {
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

    createAdminOwner: async (_, { email, password }) => {
      console.log('Creating admin owner with email:', email);
      try {
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
          console.log('Owner already exists with email:', email);
          throw new Error('Email is already associated with another account');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const owner = new Owner({
          email,
          password: hashedPassword,
          name: 'Admin',
          isActive: true,
          userType: 'ADMIN',
          permissions: ['ADMIN']
        });

        const result = await owner.save();
        console.log('Created admin owner:', result);

        return transformOwner(result);
      } catch (error) {
        console.error('Error creating admin owner:', error);
        throw error;
      }
    },

    ownerLogin: async (_, { email, password }) => {
      console.log('Owner login attempt with email:', email);
      try {
        if (!email) {
          throw new Error('Email is required');
        }

        // First verify MongoDB connection
        const count = await Owner.countDocuments();
        console.log('Total owners in database:', count);

        // Try to find owner with lean() to get plain JS object
        const owner = await Owner.findOne({ email }).lean();
        console.log('Raw owner object:', JSON.stringify(owner, null, 2));
        
        if (!owner) {
          console.log('No owner found with email:', email);
          throw new Error('User does not exist');
        }

        if (!owner.isActive) {
          console.log('Owner account is not active:', email); 
          throw new Error('Account is not active');
        }

        const isMatch = await bcrypt.compare(password, owner.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
          throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
          {
            userId: owner._id.toString(),
            email: owner.email,
            userType: owner.userType || 'VENDOR',
          },
          process.env.JWT_SECRET || 'customsecretkey'
        );

        const transformedOwner = await transformOwner(owner);
        console.log('Transformed owner:', JSON.stringify(transformedOwner, null, 2));

        // Ensure required fields are not null
        const result = {
          ...transformedOwner,
          userId: owner._id.toString(),
          token,
          tokenExpiration: 1,
          email: owner.email, // Explicitly include email
          userType: owner.userType || 'VENDOR',
          permissions: owner.permissions || [],
          userTypeId: owner.userTypeId || null,
          image: owner.image || null,
          name: owner.name || '',
          restaurants: transformedOwner.restaurants || []
        };

        console.log('Final response:', JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error('Error in ownerLogin:', error);
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
          throw new Error('Database error occurred. Please try again.');
        }
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
        process.env.JWT_SECRET || 'customsecretkey'
      );

      if (isNewUser) {
        const attachment = path.join(__dirname, '../../public/assets/tempImages/enatega.png');
        const signupTemp = await templates.signupTemplate({ email: user.name, password: '' });
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
        process.env.JWT_SECRET || 'somesupersecretkey'
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
      const attachment = path.join(__dirname, '../../public/assets/tempImages/enatega.png');

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
