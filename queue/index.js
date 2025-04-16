const Queue = require('bull');

const orderQueue = new Queue('orders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

orderQueue.on('error', error => {
  console.error('Order queue error:', error);
});

module.exports = {
  orderQueue
};
