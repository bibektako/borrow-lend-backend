const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

exports.authenticateUser = async (req, res, next) => {
  let token;
  // Get token from header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.SECRET);

      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token." });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({
            success: false,
            message: "Unauthorized: Token has expired.",
          });
      }
      // Handle other potential errors
      return res.status(500).json({
        success: false,
        message: "Authentication failed.",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided.",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin privilege required.",
    });
  }
};
