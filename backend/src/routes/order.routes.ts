import { Router } from "express";
import {
  checkout,
  getOrdersByRole,
  updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

router.post("/checkout", checkout);
router.get("/:role/:id", getOrdersByRole);
router.put("/:id/status", updateOrderStatus);

export default router;
