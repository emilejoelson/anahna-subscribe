const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.get('Authorization');
  
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'somesupersecretkey');
    if (!decodedToken) {
      req.isAuth = false;
      return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    req.userType = decodedToken.userType || null;
    req.restaurantId = decodedToken.restaurantId;
    return next();
  } catch (err) {
    req.isAuth = false;
    return next();
  }
};

module.exports = authMiddleware;
