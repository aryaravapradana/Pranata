import {
  Request,
  Response,
  NextFunction,
} from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode < 500
      ? err.message
      : "Internal Server Error";

  logger.error(message, err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  const origin =
    req.headers.origin ||
    "https://pranata-frontend.vercel.app";
  res.setHeader(
    "Access-Control-Allow-Origin",
    origin,
  );
  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true",
  );

  res.status(statusCode).json({
    error: message,
    details: err.message,
    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
};
