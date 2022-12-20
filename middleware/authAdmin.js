const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authorize = (...roles) => {
  console.log("here")
    return (req, res, next) => {
    
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            data: `User role: ${req.user.role} is not authorized to access this route`
        })
      }
      next();
    };
};

module.exports = authorize