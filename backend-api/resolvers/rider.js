// resolvers/rider.js
const Rider = require('../models/rider');
const Zone = require('../models/zone');

module.exports = {
  Query: {
    riders: async () => {
      try {
        return await Rider.find().populate('zone');
      } catch (err) {
        throw err;
      }
    },
    rider: async (_, { id }) => {
      try {
        return await Rider.findById(id).populate('zone');
      } catch (err) {
        throw err;
      }
    },
    availableRiders: async () => {
      try {
        return await Rider.find({ available: true }).populate('zone');
      } catch (err) {
        throw err;
      }
    },
    ridersByZone: async (_, { id }) => {
      try {
        return await Rider.find({ zone: id }).populate('zone');
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    createRider: async (_, { riderInput }) => {
      try {
        const rider = new Rider(riderInput);
        const savedRider = await rider.save();
        return await Rider.findById(savedRider._id).populate('zone');
      } catch (err) {
        throw err;
      }
    },
    editRider: async (_, { riderInput }) => {
      try {
        const updatedRider = await Rider.findByIdAndUpdate(riderInput._id, riderInput, { new: true }).populate('zone');
        if (!updatedRider) {
          throw new Error('Rider not found');
        }
        return updatedRider;
      } catch (err) {
        throw err;
      }
    },
    deleteRider: async (_, { id }) => {
      try {
        const deletedRider = await Rider.findByIdAndDelete(id);
        if (!deletedRider) {
          throw new Error('Rider not found');
        }
        return { _id: id };
      } catch (err) {
        throw err;
      }
    },
    toggleAvailablity: async (_, { id }) => {
      try {
        const rider = await Rider.findById(id).populate('zone');
        if (!rider) {
          throw new Error('Rider not found');
        }
        rider.available = !rider.available;
        const updatedRider = await rider.save();
        return updatedRider;
      } catch (err) {
        throw err;
      }
    },
  },
};