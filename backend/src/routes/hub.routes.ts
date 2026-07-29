import { Router } from "express";
import {
  getDashboardOverview,
  getPrices,
} from "../controllers/hub.controller";

const router = Router();

router.get(
  "/overview",
  getDashboardOverview,
);
router.get("/prices", getPrices);

export default router;
