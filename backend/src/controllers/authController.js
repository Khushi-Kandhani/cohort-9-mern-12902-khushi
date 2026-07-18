const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../middleware/logger");

function signToken(userId) {
  return jwt.sign(
    { id: userId },
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

  // Do NOT hash here — the User model's pre('save') hook does it automatically
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

  // password has select:false in the schema — must explicitly request it
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const match = await user.comparePassword(password);
  if (!match) {
    logger.warn({ email }, "Failed login attempt");
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken(user._id);
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
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { signup, login, logout };
