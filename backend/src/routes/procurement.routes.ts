import { Router } from "express";
import {
  getProcurementRequests,
  createProcurementRequest,
} from "../controllers/procurement.controller";

const router = Router();

router.get("/", getProcurementRequests);
router.post("/", createProcurementRequest);

export default router;
