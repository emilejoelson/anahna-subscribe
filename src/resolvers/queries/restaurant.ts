import Restaurant from '../../models/Restaurant';

export default {
    Query: {
      restaurant: async (_: any, { id }: { id: string }) => {
        try {
          return await Restaurant.findById(id).populate('owner');
        } catch (error) {
          throw new Error(`Error fetching restaurant: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
      getAllRestaurants: async () => {
        try {
          return await Restaurant.find({ isActive: true }).populate('owner');
        } catch (error) {
          throw new Error(`Error fetching restaurants: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    },
  };
  