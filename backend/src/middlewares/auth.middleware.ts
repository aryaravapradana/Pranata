import {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is missing.",
  );
}
const JWT_SECRET = process.env.JWT_SECRET;

// Extend Express Request interface to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res
      .status(401)
      .json({
        error:
          "Unauthorized: Missing or invalid token",
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET,
    );
    req.user = decoded; // { id, role, username, ... }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        error:
          "Unauthorized: Token expired or invalid",
      });
  }
};

export const requireProducer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    !req.user ||
    req.user.role !== "PRODUCER"
  ) {
    return res
      .status(403)
      .json({
        error:
          "Forbidden: Requires PRODUCER role",
      });
  }
  next();
};
