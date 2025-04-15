import Configuration from '../../models/Configuration';

export default {
  Query: {
    configuration: async () => {
      try {
        const config = await Configuration.findOne();
        if (!config) {
          return await Configuration.create({});
        }
        return config;
      } catch (error) {
        throw new Error(`Error fetching configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  },
};