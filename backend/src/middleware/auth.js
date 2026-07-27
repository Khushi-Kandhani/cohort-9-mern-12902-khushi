const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("./logger");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    logger.warn({ err: err.message }, "JWT verification failed");
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  try {
    const user = await User.findById(decoded.id).select("tokenVersion");
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.set("WWW-Authenticate", "Bearer");
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
