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

const errorHandler = (err: Error, req: any, res: any, next: any) => {
  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).isOperational ? err.message : "Internal Server Error";

  logger.error({ err, path: req.path, method: req.method }, err.message);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFound = (req: any, res: any, next: any) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

export { AppError, errorHandler, notFound };