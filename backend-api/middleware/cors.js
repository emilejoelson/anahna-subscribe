const cors = require('cors');

const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.DASHBOARD_URL, process.env.WEB_URL].filter(Boolean)
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = corsMiddleware;