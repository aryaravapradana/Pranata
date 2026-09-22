import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
} from "../controllers/auth.controller";
import { checkUsername } from "../controllers/profile.controller";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error:
      "Terlalu banyak percobaan, coba lagi dalam beberapa menit.",
  },
});

const router = Router();

router.get("/check-username", checkUsername);
router.post(
  "/register",
  authLimiter,
  register,
);
router.post("/login", authLimiter, login);

export default router;
