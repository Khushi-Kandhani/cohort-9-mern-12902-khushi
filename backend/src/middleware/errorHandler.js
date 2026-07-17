const logger = require("./logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";
  
  // Logs the exact error tracking stack trace and route data via Pino
  logger.error({ err, path: req.path, method: req.method }, err.message);
  
  res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { AppError, errorHandler, notFound };
