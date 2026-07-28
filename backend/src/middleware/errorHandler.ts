import { Request, Response, NextFunction } from "express";
import logger from "./logger";

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError && err.isOperational ? err.message : "Internal Server Error";

  logger.error({ err, path: req.path, method: req.method }, err.message);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
  // Don't reflect req.originalUrl (may include query strings/user input) back
  // to the client — log it server-side for debugging, but keep the
  // client-facing message generic.
  logger.warn({ path: req.originalUrl, method: req.method }, "Route not found");
  const error = new AppError("Route not found", 404);
  next(error);
};

export { AppError, errorHandler, notFound };
