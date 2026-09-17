import { Router } from "express";
import {
  getAllProducts,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  toggleSponsoredProduct,
} from "../controllers/product.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllProducts);
router.get("/seller/:id", getSellerProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.patch("/:id/sponsor", verifyToken, toggleSponsoredProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;

