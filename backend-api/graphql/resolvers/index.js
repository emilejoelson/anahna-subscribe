const { getDashboardOrdersByType } = require('./dashboard');

const rootResolver = {
  Query: {
    getDashboardOrdersByType,
  },
};

module.exports = rootResolver;