import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteReview } from "../controllers/review.controllers.js";

const router = Router();

router.route("/:id").delete(verifyJWT, deleteReview);

export default router;
