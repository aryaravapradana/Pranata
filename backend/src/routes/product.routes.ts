import { Router } from "express";
import {
  getAllProducts,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getAllProducts);
router.get("/seller/:id", getSellerProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
