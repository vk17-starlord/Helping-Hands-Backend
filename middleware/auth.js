const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
      // Set token from cookie
    }
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }
  
    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            data: "Not authorized to access this route"
        });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      req.user = await User.findById(decoded.id);
  
      next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            data: "Not authorized to access this route"
        });
    }
}

module.exports = protect
  