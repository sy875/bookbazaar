import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares";
import { validateNewBook } from "../validators/book.validators";
import { validate } from "../validators/validate";
import {
  createNewBookEntry,
  deleteBook,
  getAllBooks,
  getBookById,
  searchBooks,
  updateBook,
} from "../controllers/book.controller";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators";

const router = Router();

//get all books
router.get("/", getAllBooks);

//search book
router.get("/search", searchBooks);

//get book by id
router.get("/:bookId", mongoIdPathVariableValidator("bookId"), getBookById);

//create new book entry
router.post(
  "/new-book",
  verifyJWT,
  validateNewBook(),
  validate,
  createNewBookEntry
);

router.patch("/:bookId",verifyJWT,mongoIdPathVariableValidator("bookId"),updateBook)

router.delete("/:bookId",verifyJWT,mongoIdPathVariableValidator("bookId"),deleteBook)

export default router;
