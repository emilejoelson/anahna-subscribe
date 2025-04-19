const scriptCache = new Map();
const loadedScripts = new Set();

const scriptCacheMiddleware = (req, res, next) => {
  // Check for Google Maps API requests
  if (req.url.includes('maps.googleapis.com')) {
    const cacheKey = req.url;
    
    // Prevent duplicate script loading
    if (loadedScripts.has(cacheKey)) {
      console.warn('Preventing duplicate Google Maps script load:', cacheKey);
      return res.status(304).end();
    }

    // Serve from cache if available
    if (scriptCache.has(cacheKey)) {
      console.log('Serving cached Google Maps script');
      return res.send(scriptCache.get(cacheKey));
    }

    // Track loaded script
    loadedScripts.add(cacheKey);
  }
  next();
};

module.exports = scriptCacheMiddleware;