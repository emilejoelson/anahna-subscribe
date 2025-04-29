const authMiddleware = require('./is-auth');
const corsMiddleware = require('./cors');
const errorHandler = require('./error-handler');
const scriptCacheMiddleware = require('./script-cache');

module.exports = {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  scriptCacheMiddleware
};