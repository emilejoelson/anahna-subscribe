const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const User = require('../models/user')
const Restaurant = require('../models/restaurant')
const { sendEmail } = require('../helpers/email')
const { sendTextEmail } = require('../helpers/email')
const {
  signupTemplate,
  signupText,
  verificationTemplate,
  resetPasswordTemplate
} = require('../helpers/templates')
const { checkPhoneAlreadyUsed } = require('../helpers/utilities')
const { sendNotification } = require('../helpers/utilities')
const { transformUser, transformRestaurants } = require('./merge')
const { sendSMS } = require('../helpers/sms')
const { get, post } = require('../helpers/api')
const Configuration = require('../models/configuration')
require('dotenv').config();

module.exports = {
  Query: {
    profile: async(_, args, { req }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const user = await User.findById(req.userId)
          .select('-password') // Exclure le mot de passe
          .lean() // Pour de meilleures performances
        
        if (!user) throw new Error('User does not exist')

        return {
          ...user,
          _id: user._id.toString(),
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          phoneIsVerified: user.phoneIsVerified || false,
          emailIsVerified: user.emailIsVerified || false,
          isActive: user.isActive || false,
          isOrderNotification: user.isOrderNotification || false,
          isOfferNotification: user.isOfferNotification || false,
          addresses: user.addresses || [],
          notificationToken: user.notificationToken || '',
          favourite: user.favourite || [],
          userType: user.userType || 'user',
          createdAt: user.createdAt ? user.createdAt.toISOString() : null,
          updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null
        }
      } catch (error) {
        console.error('Profile error:', error)
        throw error
      }
    },
    users: async(_, args, context) => {
      console.log('users')
      try {
        // TODO: need pagination here
        const users = await User.find()
        return users.map(user => {
          return transformUser(user)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    userFavourite: async(_, args, { res, req }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        // Fixing zones issues
        // if (!zones.length) return { restaurants: [] }
        // console.log(restaurants)
        const user = await User.findById(req.userId)
        if (!user) throw new Error('Unauthenticated')
        console.log(user)
        const restaurants = await Restaurant.find({
          _id: { $in: user.favourite }
          // zone: { $in: zones.map(z => z.id) },
          // isAvailable: true,
          // isActive: true
        })
        console.log(restaurants)
        return transformRestaurants(restaurants)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    sendFormSubmission: async(_, args) => {
      console.log('sendFormSubmission', args)
      try {
        const { name, email, message } = args.formSubmissionInput
        if (!name || !email || !message) {
          throw new Error('Invalid input')
        }
        const htmlTemplate = `
          <h3>Form Submission</h3>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message: ${message}</p>
        `
        const emailResult = await sendTextEmail(
          process.env.FORM_SUBMISSION_EMAIL,
          'Form Submission',
          htmlTemplate
        )
        if (emailResult) {
          return {
            message: 'Form submission was successful',
            status: 'Success'
          }
        } else {
          return {
            message: 'Form submission was not successful',
            status: 'Failed'
          }
        }
      } catch (err) {
        console.log('Error when sending Email', err)
        throw new Error(`Error when sending Email ${err}`)
      }
    },
    emailExist: async(_, args, { res, req }) => {
      console.log('CheckingEmail')
      console.log(args)
      try {
        const emailExist = await User.findOne({ email: args.email })
        if (emailExist) {
          return emailExist
        } else {
          return 'null'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    phoneExist: async(_, args, { res, req }) => {
      console.log('CheckingPhone')
      try {
        const phoneExist = await User.findOne({ 
          phone: args.phone,
          _id: { $ne: req.userId }  // exclude current user
        })
        if (phoneExist) {
          return phoneExist
        } else {
          return 'null'
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    createUser: async(_, args, context) => {
      console.log('createUser', args.userInput)
      try {
        if (args.userInput.appleId) {
          const existingAppleId = await User.findOne({
            appleId: args.userInput.appleId
          })
          if (existingAppleId) {
            throw new Error('Apple account is already registered. Please Login')
          }
        }
        if (args.userInput.email) {
          const existingEmail = await User.findOne({
            email: args.userInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        if (args.userInput.phone) {
          const existingPhone = await User.findOne({
            phone: args.userInput.phone
          })
          if (existingPhone) {
            throw new Error('Phone is already associated with another account.')
          }
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const userDetails = {
          appleId: args.userInput.appleId,
          email: args.userInput.email,
          password: hashedPassword,
          phone: args.userInput.phone,
          name: args.userInput.name,
          notificationToken: args.userInput.notificationToken,
          isOrderNotification: !!args.userInput.notificationToken,
          isOfferNotification: !!args.userInput.notificationToken,
          userType: 'default',
          emailIsVerified: true
        }
        const user = new User(userDetails)

        // sendUserInfoToZapier({
        //   email: args.userInput.email,
        //   phone: args.userInput.phone,
        //   name: args.userInput.name
        // })

        const result = await user.save()
        const attachment = 'https://res.cloudinary.com/dzdohbv3s/image/upload/v1745357465/cdmlathwtjtub8ko5z3q.jpg';
        // path.join(
        //   __dirname,
        //   '../../public/assets/tempImages/enatega.png'
        // )
        const signupTemp = await signupTemplate({name: args.userInput.name, email: args.userInput.email})
        const signupTxt = await signupText({name: args.userInput.name, email: args.userInput.email})
        sendEmail(
          result.email,
          'Account Creation',
          signupTxt,
          signupTemp,
          attachment
        )
        const token = jwt.sign(
          {
            userId: result.id,
            email: result.email || result.appleId
          },
          process.env.JWT_SECRET,
        )
        console.log({
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        })
        return {
          ...result._doc,
          userId: result.id,
          token: token,
          tokenExpiration: 1
        }
      } catch (err) {
        throw err
      }
    },
    Deactivate: async(_, args, { req, res }) => {
      const deactivateByEmail = await User.findOne({
        email: args.email
      })
      deactivateByEmail.isActive = args.isActive
      console.log(deactivateByEmail)
      await deactivateByEmail.save()
      return deactivateByEmail
    },
    updateUser: async(_, args, { req, res }) => {
      console.log('Update user: ', args.updateUserInput, req.userId)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const user = await User.findById(req.userId)
      if (!user) throw new Error('Please logout and login again')
      // check if phone number is already associated with another account
      if (!(await checkPhoneAlreadyUsed(req.userId, args.updateUserInput.phone))) {
        try {
          if (args.updateUserInput.phone !== user.phone) {
            user.phoneIsVerified = args.updateUserInput.phoneIsVerified
          }
          if (args.updateUserInput.phoneIsVerified) {
            user.phoneIsVerified = args.updateUserInput.phoneIsVerified
          }
          user.name = args.updateUserInput.name
          user.phone = args.updateUserInput.phone
          await user.save()
          
          return {
            _id: user._id.toString(),
            name: user.name || '',
            phone: user.phone || '',
            phoneIsVerified: user.phoneIsVerified || false,
            emailIsVerified: user.emailIsVerified || false,
            email: user.email || '',
            isActive: user.isActive || false,
            isOrderNotification: user.isOrderNotification || false,
            isOfferNotification: user.isOfferNotification || false
          }
        } catch (err) {
          console.log(err)
          throw err
        }
      } else {
        throw new Error('Phone number is already associated with another account')
      }
    },
    updateNotificationStatus: async(_, args, { req, res }) => {
      console.log('updateNotificationStatus')
      try {
        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('User not found')
        }
        user.isOfferNotification = args.offerNotification
        user.isOrderNotification = args.orderNotification
        user.save()
        return transformUser(user)
      } catch (e) {
        return false
      }
    },
    addFavourite: async(_, args, { res, req }) => {
      console.log('UpdateFavourite')
      try {
        if (!req.isAuth || !args.id) {
          throw new Error('Unauthenticated!')
        }
        const user = await User.findById(req.userId)
        const checkRestaurant = await user.favourite.findIndex(
          id => id === args.id
        )
        if (checkRestaurant < 0) user.favourite.push(args.id)
        else {
          user.favourite.splice(checkRestaurant, 1)
        }
        // update favourite array
        const result = await user.save()
        return transformUser(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    sendOtpToEmail: async(_, args, { res, req }) => {
      console.log('Send otp to email: ', args.email, args.otp)
      try {
        if (!args.email) throw new Error('Email is required')
        if (!args.otp) throw new Error('Otp is required')
        const resetPasswordTemp = await resetPasswordTemplate(args.otp)
        const attachment = 'https://res.cloudinary.com/dzdohbv3s/image/upload/v1745357465/cdmlathwtjtub8ko5z3q.jpg';
        // path.join(
        //   __dirname,
        //   '../../public/assets/tempImages/enatega.png'
        // )
        sendEmail(
          args.email,
          'OTP to confirm email',
          'OTP to confirm email address',
          resetPasswordTemp,
          attachment
        )
        return {
          result: true
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    sendOtpToPhoneNumber: async(_, args, { res, req }) => {
      console.log('Send otp to phone: ', args.phone, args.otp)
      try {
        if (!args.phone) throw new Error('Phone is required')
        if (!args.otp) throw new Error('Otp is required')
        const configuration = await Configuration.findOne()
        if (!configuration.skipMobileVerification) {
          sendOtpToPhone(
            args.phone,
            `Your Enatega phone verfication code is: ${args.otp}`
          )
        }
        return {
          result: true
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
