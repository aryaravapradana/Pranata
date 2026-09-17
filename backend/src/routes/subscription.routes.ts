import { Router } from "express";
import {
  upgradeToPlus,
  getSubscriptionStatus,
  cancelSubscription,
} from "../controllers/subscription.controller";

const router = Router();

router.post("/upgrade", upgradeToPlus);
router.post("/cancel", cancelSubscription);
router.get("/status/:profileId", getSubscriptionStatus);

export default router;
