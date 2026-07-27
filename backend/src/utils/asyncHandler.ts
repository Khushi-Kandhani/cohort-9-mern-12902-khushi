import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user: { id: string };
}

const asyncHandler = <T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};

export default asyncHandler;