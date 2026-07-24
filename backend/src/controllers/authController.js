const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../middleware/logger");

function signToken(userId, tokenVersion) {
  return jwt.sign(
    { id: userId, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }
  const user = await User.create({ name, email, password });
  logger.info({ userId: user._id }, "New user registered");
  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  const match = await user.comparePassword(password);
  if (!match) {
    const emailHash = crypto.createHash("sha256").update(email).digest("hex").slice(0, 12);
    logger.warn({ emailHash }, "Failed login attempt");
    throw new AppError("Invalid credentials", 401);
  }
  const token = signToken(user._id, user.tokenVersion);
  logger.info({ userId: user._id }, "User logged in");
  res.status(200).json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    },
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  logger.info({ userId: req.user.id }, "User logged out, tokens revoked");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { signup, login, logout };
