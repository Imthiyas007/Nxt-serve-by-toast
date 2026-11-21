const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserFromRequest = async (req) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id).select("-password");
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    req.user = await getUserFromRequest(req);
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization) return next();

  try {
    req.user = await getUserFromRequest(req);
    if (!req.user) {
      return res.status(401).json({ message: "Token failed" });
    }
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

module.exports = { protect, optionalProtect };
