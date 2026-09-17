import { Router } from "express";
import authRoutes from "./auth.routes";
import { verifyToken } from "../middlewares/auth.middleware";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import productRoutes from "./product.routes";
import profileRoutes from "./profile.routes";
import hubRoutes from "./hub.routes";
import walletRoutes from "./wallet.routes";
import subscriptionRoutes from "./subscription.routes";
import procurementRoutes from "./procurement.routes";

const router = Router();

router.use("/profile", authRoutes); // /api/profile/register, /api/profile/login
router.use("/cart", verifyToken, cartRoutes);
router.use("/orders", verifyToken, orderRoutes);
router.use("/products", productRoutes);
router.use("/profile", verifyToken, profileRoutes); // /api/profile/:id, /api/profile/check-username
router.use("/hub", verifyToken, hubRoutes); // /api/hub/overview, /api/prices
router.use("/wallet", verifyToken, walletRoutes); // /api/wallet/:profileId, /api/wallet/topup, /api/wallet/withdraw
router.use("/subscription", verifyToken, subscriptionRoutes); // /api/subscription/upgrade, /api/subscription/status/:id
router.use("/procurement", verifyToken, procurementRoutes); // /api/procurement

export default router;

