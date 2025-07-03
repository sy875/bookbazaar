import { body } from "express-validator";

export const validateNewBook = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .isLength({ min: 5, max: 100 })
      .withMessage("Title is required"),

    body("author")
      .trim()
      .notEmpty()
      .withMessage("Author is required")
      .isString()
      .withMessage("Author must be a string")
      .toLowerCase(),

    body("genre")
      .trim()
      .notEmpty()
      .withMessage("Genre is required")
      .isString()
      .withMessage("Genre must be a string")
      .toLowerCase(),

    body("bookCoverImage")
      .trim()
      .notEmpty()
      .withMessage("Book cover image is required")
      .isURL()
      .withMessage("Book cover image must be a valid URL"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 50, max: 10000 })
      .withMessage("Price must be between 50 and 10000"),

    body("quantity")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Quantity must be between 1 and 100"),

    body("publishedYear")
      .notEmpty()
      .withMessage("Published year is required")
      .isInt({ min: 0 })
      .withMessage("Published year must be a valid year"),

  ];
};
