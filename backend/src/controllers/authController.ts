import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import logger from "../middleware/logger";
import { AuthenticatedRequest } from "../middleware/auth";
import { Request, Response } from "express";

function signToken(userId: string, tokenVersion: number) {
  // @ts-ignore
  return jwt.sign(
    { id: userId, tokenVersion },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (err) {
    // findOne above is just a pre-check, not atomic - a concurrent signup
    // for the same email can still slip past it and hit the unique index.
    if (err.code === 11000) {
      throw new AppError("Email already in use", 409);
    }
    throw err;
  }

  logger.info({ userId: user._id }, "New user registered");
  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  const match = await user.comparePassword(password);
  if (!match) {
    let emailHash = "";
    try {
      emailHash = crypto
        .createHmac("sha256", process.env.LOG_HMAC_KEY!)
        .update(email)
        .digest("hex")
        .slice(0, 12);
    } catch {
    }
    logger.warn({ emailHash }, "Failed login attempt");
    throw new AppError("Invalid credentials", 401);
  }
  const token = signToken(user._id.toString(), user.tokenVersion);
  logger.info({ userId: user._id }, "User logged in");
  res.status(200).json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    },
  });
});

const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  logger.info({ userId: req.user.id }, "User logged out, tokens revoked");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export { signup, login, logout };