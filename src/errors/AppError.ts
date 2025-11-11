export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundError = (message = "Resource not found") => new AppError(message, 404);
export const unauthorizedError = (message = "Unauthorized") => new AppError(message, 401);
export const badRequestError = (message = "Bad request", details?: unknown) =>
  new AppError(message, 400, details);
export const conflictError = (message = "Conflict") => new AppError(message, 409);
