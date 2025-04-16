const Queue = require('bull');

const orderQueue = new Queue('orders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
});

orderQueue.on('error', error => {
  console.error('Order queue error:', error);
});

orderQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

module.exports = {
  orderQueue
};
