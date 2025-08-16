import { Router } from "express";
import {
  verifyJWT,
  verifyPermission,
} from "../middlewares/auth.middlewares.js";
import { validateNewBook } from "../validators/book.validators.js";
import { validate } from "../validators/validate.js";
import {
  createNewBookEntry,
  deleteBook,
  getAllBooks,
  getBookById,
  searchBooks,
  updateBook,
} from "../controllers/book.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";
import { UserRolesEnum } from "../utils/constants.js";
import { createReview, getReviews } from "../controllers/review.controllers.js";

const router = Router();

//get all books
router
  .route("/")
  .get(getAllBooks)
  .post(verifyJWT, validateNewBook(), validate, createNewBookEntry);

//search book
router.get("/search", searchBooks);

router
  .route("/:id")
  .all(mongoIdPathVariableValidator("id"))
  .get(getBookById)
  .patch(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), updateBook)
  .delete(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), deleteBook);

//review route

router
  .route("/:bookId/reviews")
  .all(verifyJWT)
  .post(createReview)
  .get(getReviews);

export default router;
