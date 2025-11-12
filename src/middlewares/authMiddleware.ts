import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyJwt } from "../utils/jwt";
import { tokenStore } from "../services/tokenStore";
import { unauthorizedError } from "../errors/AppError";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(unauthorizedError("Missing Authorization header"));
  }

  const token = header.replace("Bearer ", "").trim();
  if (!token || tokenStore.isRevoked(token)) {
    return next(unauthorizedError("Invalid or expired token"));
  }

  try {
    const payload = verifyJwt(token, env.jwtSecret);
    req.user = { ...payload, token };
    return next();
  } catch {
    return next(unauthorizedError("Invalid or expired token"));
  }
};
