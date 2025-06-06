const Address = require('../models/address');
const User = require('../models/user');
const Point = require('../models/point');
const { transformUser } = require('./merge');

module.exports = {
  Mutation: {
    createAddress: async (_, { addressInput }, { req }) => {
      console.log('Creating address');
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');

        await User.updateMany(
          { _id: req.userId },
          { $set: { 'addresses.$[].selected': false } }
        );

        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        const address = {
          location: {
            type: 'Point',
            coordinates: [addressInput.longitude, addressInput.latitude]
          },
          deliveryAddress: addressInput.deliveryAddress,
          details: addressInput.details || '',
          label: addressInput.label || 'Home',
          selected: true
        };

        user.addresses.push(address);
        const updatedUser = await user.save();

        return transformUser(updatedUser);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    editAddress: async (_, { addressInput }, { req }) => {
      console.log('Editing address');
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');

        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        const addressToUpdate = user.addresses.id(addressInput._id);
        if (!addressToUpdate) throw new Error('Address not found');

        Object.assign(addressToUpdate, {
          location: {
            type: 'Point',
            coordinates: [addressInput.longitude, addressInput.latitude]
          },
          deliveryAddress: addressInput.deliveryAddress,
          details: addressInput.details || addressToUpdate.details,
          label: addressInput.label || addressToUpdate.label
        });

        const updatedUser = await user.save();
        return transformUser(updatedUser);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    deleteAddress: async (_, { id }, { req }) => {
      console.log('Deleting address');
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');

        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        user.addresses.id(id).remove();
        const updatedUser = await user.save();

        return transformUser(updatedUser);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    deleteBulkAddresses: async (_, { ids }, { req }) => {
      console.log('Deleting bulk addresses', ids);
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');

        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        if (ids?.length > 0) {
          ids.forEach(id => {
            console.log('Removing address ID:', id);
            user.addresses.id(id).remove();
          });

          const updatedUser = await user.save();
          return transformUser(updatedUser);
        }

        return transformUser(user);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    selectAddress: async (_, { id }, { req }) => {
      console.log('Selecting address');
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');

        await User.updateMany(
          { _id: req.userId },
          { $set: { 'addresses.$[].selected': false } }
        );

        const user = await User.findById(req.userId);
        if (!user) throw new Error('User not found');

        user.addresses.id(id).set({ selected: true });
        const updatedUser = await user.save();

        return transformUser(updatedUser);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
