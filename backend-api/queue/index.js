const { Bull, redisOptions } = require("../config/bull");

const orderQueue = new Bull("order", redisOptions);

module.exports = {
  orderQueue,
};
