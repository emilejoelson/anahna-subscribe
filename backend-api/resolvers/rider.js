const Rider = require("../models/rider");
const { RIDER_UPDATED } = require("../constants/subscriptionEvents");
const { pubsub } = require("../config/pubsub");
module.exports = {
  Query: {
    riders: async () => {
      try {
        return await Rider.find().populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
    rider: async (_, { id }) => {
      try {
        return await Rider.findById(id).populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
    availableRiders: async () => {
      try {
        return await Rider.find({ available: true }).populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
    ridersByZone: async (_, { id }) => {
      try {
        return await Rider.find({ zone: id }).populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createRider: async (_, { riderInput }) => {
      const { name, username, password, phone, zone, vehicleType } = riderInput;

      try {
        // Check if username already exists
        const existingRider = await Rider.findOne({ username });
        if (existingRider) {
          throw new Error("Username already exists");
        }

        const rider = new Rider({
          name,
          username,
          password, // Note: In production, you should hash this password
          phone,
          zone,
          vehicleType,
          available: true,
          assigned: false,
        });

        const result = await rider.save();
        return await Rider.findById(result._id).populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
    editRider: async (_, { riderInput }) => {
      const {
        _id,
        name,
        username,
        password,
        phone,
        zone,
        vehicleType,
        available,
      } = riderInput;

      try {
        const existingRider = await Rider.findOne({
          username,
          _id: { $ne: _id },
        });
        if (existingRider) {
          throw new Error("Username already exists");
        }

        const rider = await Rider.findById(_id);
        if (!rider) {
          throw new Error("Rider not found");
        }

        rider.name = name || rider.name;
        rider.username = username || rider.username;
        if (password) rider.password = password;
        rider.phone = phone || rider.phone;
        rider.zone = zone || rider.zone;
        rider.vehicleType = vehicleType || rider.vehicleType;
        rider.available = available !== undefined ? available : rider.available;

        await rider.save();

        const updatedRider = await Rider.findById(_id).populate("zone");

        pubsub.publish(RIDER_UPDATED, {
          riderUpdated: updatedRider,
        });

        return updatedRider;
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteRider: async (_, { id }) => {
      try {
        const rider = await Rider.findById(id);
        if (!rider) {
          throw new Error("Rider not found");
        }

        await Rider.findByIdAndDelete(id);
        return { _id: id };
      } catch (error) {
        throw new Error(error);
      }
    },
    toggleAvailablity: async (_, { id }) => {
      try {
        const rider = await Rider.findById(id);
        if (!rider) {
          throw new Error("Rider not found");
        }

        rider.available = !rider.available;
        await rider.save();
        return await Rider.findById(id).populate("zone");
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Subscription: {
    riderUpdated: {
      subscribe: () => pubsub.asyncIterator(RIDER_UPDATED),
    },
  },
};
