const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("./logger");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("tokenVersion");
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    logger.warn({ err: err.message }, "JWT verification failed");
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
