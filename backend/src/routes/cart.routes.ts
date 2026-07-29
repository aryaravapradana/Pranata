import { Router } from "express";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";

const router = Router();

router.get("/:buyerId", getCart);
router.post("/:buyerId", updateCartItem);
router.delete(
  "/:buyerId/:productId",
  removeCartItem,
);
router.delete("/:buyerId", clearCart);

export default router;
