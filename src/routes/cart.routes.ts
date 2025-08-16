import { Router } from "express";
import {
  addItemOrUpdateItemQuantity,
  clearCart,
  getUserCart,
  removeItemFromCart,
} from "../controllers/cart.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").get(verifyJWT, getUserCart).get(verifyJWT, clearCart);

router
  .route("/:bookId")
  .all(verifyJWT)
  .post(addItemOrUpdateItemQuantity)
  .put(removeItemFromCart);

export default router;
