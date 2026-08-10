import jwt from "jsonwebtoken";
import User from "../models/User";
import logger from "./logger";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/asyncHandler";

export { AuthenticatedRequest };

async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    res.set("WWW-Authenticate", "Bearer");
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "JWT verification failed");
    res.set("WWW-Authenticate", "Bearer");
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  if (typeof decoded.id !== "string" || typeof decoded.tokenVersion !== "number") {
    logger.warn("JWT payload missing expected fields");
    res.set("WWW-Authenticate", "Bearer");
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  try {
    const user = await User.findById(decoded.id).select("tokenVersion");
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.set("WWW-Authenticate", "Bearer");
      res.status(401).json({ success: false, message: "Invalid or expired token" });
      return;
    }
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(err);
  }
}

export default authMiddleware;
