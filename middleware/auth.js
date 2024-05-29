// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const config = require('config');

// module.exports = function (req, res, next) {
//   // Get token from header
//   const token = req.header('Authorization').replace('Bearer ', '');

//   // Check if no token
//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   // Verify token
//   try {
//     console.log("THIS IS TOKEN:",token);
//     const decoded = jwt.verify(token, config.get('jwtSecret'));
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };



const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = config.jwtSecret;
    
    const decoded = jwt.verify(token, jwtSecret); // Use hardcoded secret for testing if needed
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
