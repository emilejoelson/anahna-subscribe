// backend/resolvers/banner.js
const Banner = require('../models/banner');

const bannerResolvers = {
  Query: {
    banners: async () => {
      try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        return banners.map(banner => ({ ...banner._doc, _id: banner.id }));
      } catch (err) {
        console.error('Error fetching banners:', err);
        throw new Error('Failed to fetch banners');
      }
    },
  },
  Mutation: {
    createBanner: async (_, { bannerInput }) => {
      console.log('Creating a new banner with input:', bannerInput);
      try {
        const banner = new Banner({
          title: bannerInput.title,
          description: bannerInput.description,
          action: bannerInput.action,
          file: bannerInput.file,
          screen: bannerInput.screen,
          parameters: bannerInput.parameters,
          isActive: true,
        });
        const result = await banner.save();
        return { ...result._doc, _id: result.id };
      } catch (err) {
        console.error('Error creating banner:', err);
        throw new Error('Failed to create banner');
      }
    },
    editBanner: async (_, { bannerInput }) => {
      console.log('Editing banner with input:', bannerInput);
      try {
        const updatedBanner = await Banner.findByIdAndUpdate(
          bannerInput._id,
          {
            title: bannerInput.title,
            description: bannerInput.description,
            action: bannerInput.action,
            file: bannerInput.file,
            screen: bannerInput.screen,
            parameters: bannerInput.parameters,
          },
          { new: true }
        );
        if (!updatedBanner) {
          throw new Error('Banner not found');
        }
        return { ...updatedBanner._doc, _id: updatedBanner.id };
      } catch (err) {
        console.error('Error editing banner:', err);
        throw new Error('Failed to edit banner');
      }
    },
    deleteBanner: async (_, { id }) => {
      console.log('Deleting banner with ID:', id);
      try {
        const deletedBanner = await Banner.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        );
        if (!deletedBanner) {
          throw new Error('Banner not found');
        }
        return true; // Indicate successful deletion
      } catch (err) {
        console.error('Error deleting banner:', err);
        throw new Error('Failed to delete banner');
      }
    },
  },
};

module.exports = bannerResolvers;