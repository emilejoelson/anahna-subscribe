const Offer = require('../models/offer');

module.exports = {
  Query: {
    offers: async () => {
      try {
        const offers = await Offer.find({ isActive: true });
        return offers.map(offer => ({
          ...offer._doc,
          _id: offer.id
        }));
      } catch (err) {
        throw err;
      }
    }
  },
  Mutation: {
    createOffer: async (_, { offerInput }) => {
      try {
        const offer = new Offer({
          ...offerInput
        });
        const result = await offer.save();
        return {
          ...result._doc,
          _id: result.id
        };
      } catch (err) {
        throw err;
      }
    }
  }
};
