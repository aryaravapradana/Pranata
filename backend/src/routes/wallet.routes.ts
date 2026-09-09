import { Router } from "express";
import {
  getWallet,
  topUpWallet,
  withdrawWallet,
} from "../controllers/wallet.controller";

const router = Router();

router.get("/:profileId", getWallet);
router.post("/topup", topUpWallet);
router.post("/withdraw", withdrawWallet);

export default router;
