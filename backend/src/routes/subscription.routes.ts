import { Router } from "express";
import {
  upgradeToPlus,
  getSubscriptionStatus,
} from "../controllers/subscription.controller";

const router = Router();

router.post("/upgrade", upgradeToPlus);
router.get("/status/:profileId", getSubscriptionStatus);

export default router;
