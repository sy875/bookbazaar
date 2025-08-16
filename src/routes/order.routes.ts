import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  generateRazorpayOrder,
  getCustomerAllOrders,
  getOrderById,
  verifyRazorpayPayment,
} from "../controllers/order.controllers.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, generateRazorpayOrder)
  .get(verifyJWT, getCustomerAllOrders);

router.route("/verify-payment").post(verifyJWT, verifyRazorpayPayment);
router.route("/:id").get(verifyJWT, getOrderById);

export default router;
