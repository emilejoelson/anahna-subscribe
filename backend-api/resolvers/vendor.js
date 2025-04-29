const Owner = require('../models/owner');
const Restaurant = require('../models/restaurant');
const { transformOwner } = require('./merge')
const bcrypt = require('bcryptjs')

module.exports = {
  Query: {
    vendors: async(_, args, context) => {
      console.log('vendors')
      try {
        // TODO: might need pagination here
        const vendors = await Owner.find({ userType: 'VENDOR', isActive: true })
        if (!vendors || !vendors.length) return []
        // return vendors.map(vendor => {
        //   return transformOwner(vendor)
        // })
        return vendors.map((vendor) => ({
          ...vendor._doc,
          unique_id: vendor.id,
        }));
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getVendor: async(_, args, context) => {
      console.log('getVendor')
      try {
        const vendor = await Owner.findById(args.id)
        return transformOwner(vendor)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    // TODO: need to rethink about how restaurants are being added
    createVendor: async(_, args, context) => {
      console.log('createVendor')
      try {
        if (args.vendorInput.email) {
          const existingEmail = await Owner.findOne({
            email: args.vendorInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        const hashedPassword = await bcrypt.hash(args.vendorInput.password, 12)
        const owner = Owner({
          email: args.vendorInput.email,
          firstName: args.vendorInput.firstName,
          lastName: args.vendorInput.lastName,
          name: args.vendorInput.name,
          phoneNumber: args.vendorInput.phoneNumber,
          image: args.vendorInput.image,
          password: hashedPassword,
          userType: 'VENDOR'
        })
        const result = await owner.save()
        return {
          ...result._doc,
          _id: result.id,
        };
        // return transformOwner(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editVendor: async (_, args, context) => {
      console.log('editVendor');
      try {
        const owner = await Owner.findOne({
          _id: args.vendorInput._id,
          isActive: true
        });
    
        if (!owner) {
          throw new Error('Vendor not found or inactive');
        }
    
        // unique email check
        if (args.vendorInput.email !== owner.email) {
          const existingOwnerWithEmail = await Owner.findOne({
            email: args.vendorInput.email,
            isActive: true,
            _id: { $ne: args.vendorInput._id } // get all vendors except the one being edited
          });
    
          if (existingOwnerWithEmail) {
            throw new Error('Email is associated with another account');
          }
        }
    
        if (args.vendorInput.password) {
          const hashedPassword = await bcrypt.hash(args.vendorInput.password, 12);
          owner.password = hashedPassword;
        }
    
        owner.email = args.vendorInput.email;
        owner.firstName = args.vendorInput.firstName;
        owner.lastName = args.vendorInput.lastName;
        owner.name = args.vendorInput.name;
        owner.phoneNumber = args.vendorInput.phoneNumber;
        owner.image = args.vendorInput.image;
    
        const result = await owner.save();
        return {
          ...result._doc,
          _id: result.id,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // TODO: if vendor is deleted, shouldn't the restaurants also(isActive:false)
    deleteVendor: async(_, args, context) => {
      console.log('Delete Vendor')
      try {
        const owner = await Owner.findById(args.id)
        owner.restaurants.forEach(async element => {
          const restaurant = await Restaurant.findById(element)
          restaurant.isActive = false
          await restaurant.save()
        })
        owner.isActive = false
        await owner.save()
        return true
      } catch (error) {
        console.log(error)
      }
    }
  }
}
