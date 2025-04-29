const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log('Auth check:', { 
    hasAuthHeader: !!authHeader,
    authHeader: authHeader
  });
  
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];
  console.log('Token check:', {
    hasToken: !!token,
    tokenLength: token?.length
  });

  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'customsecretkey';
    console.log('Using JWT secret:', { secret });
    const decodedToken = jwt.verify(token, secret);
    console.log('Token verification:', {
      isValid: !!decodedToken,
      userId: decodedToken?.userId,
      userType: decodedToken?.userType
    });

    if (!decodedToken) {
      req.isAuth = false;
      return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    req.userType = decodedToken.userType || null;
    req.restaurantId = decodedToken.restaurantId;
    console.log(req.userId, req.userType, req.restaurantId);
    
    return next();
  } catch (err) {
    console.error('Token verification failed:', err);
    req.isAuth = false;
    return next();
  }
};

module.exports = authMiddleware;
