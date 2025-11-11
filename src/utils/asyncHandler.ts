import type { NextFunction, Request, Response } from "express";

type Handler<T extends Request = Request> = (req: T, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  <T extends Request = Request>(handler: Handler<T>) =>
  (req: T, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
