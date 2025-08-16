import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { Book } from "../models/book.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { getMongoosePaginationOptions } from "../utils/helper.js";

export const createNewBookEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      author,
      genre,
      bookCoverImage,
      description,
      price,
      publishedYear,
      stock,
    } = req.body;

    const book = await Book.create({
      title,
      author,
      genre,
      bookCoverImage,
      description,
      price,
      publishedYear,
      stock,
      addedBy: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, book, "Book created successfully"));
  }
);

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  //Do not send userid to client
  const productAggregate = Book.aggregate([
    { $match: {} },
    {
      $project: {
        addedBy: 0,
      },
    },
  ]);

  const pageNum =
    typeof page === "string" ? parseInt(page, 10) : Number(page) || 1;
  const limitNum =
    typeof limit === "string" ? parseInt(limit, 10) : Number(limit) || 10;

  const books = await Book.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page: pageNum,
      limit: limitNum,
      customLabels: {
        totalDocs: "totalBooks",
        docs: "books",
      },
    })
  );
  return res
    .status(200)
    .json(new ApiResponse(200, books, "Fetched books successfully"));
});

export const searchBooks = asyncHandler(async (req: Request, res: Response) => {
  const { query, genre, author } = req.query;

  interface MatchConditions {
    genre?: string;
    title?: { $regex: string; $options: string };
    author?: { $regex: string; $options: string };
  }

  const matchConditions: MatchConditions = {};

  if (genre) {
    matchConditions.genre = genre as string;
  }

  if (query) {
    matchConditions.title = { $regex: query as string, $options: "i" };
  }
  if (author) {
    matchConditions.author = { $regex: author as string, $options: "i" };
  }

  const pipeline = [
    // match condition according to title and genre
    {
      $match: matchConditions,
    },
    //remove user id
    {
      $project: {
        userId: 0,
      },
    },
  ];

  const books = await Book.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, books, "Fetched books successfully"));
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const { id: bookId } = req.params;
  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(404, "Book does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, book, "Book fetched Successfully"));
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { id: bookId } = req.params;

  const {
    title,
    author,
    genre,
    bookCoverImage,
    description,
    price,
    publishedYear,
    quantity,
  } = req.body;

  const book = await Book.findById(bookId);

  // Check the book existence
  if (!book) {
    throw new ApiError(404, "Book does not exist");
  }

  //Only creator of book can update it
  if (!book.userId.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this book");
  }

  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    {
      $set: {
        title,
        author,
        genre,
        bookCoverImage,
        description,
        price,
        publishedYear,
        quantity,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book updated successfully"));
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { id: bookId } = req.params;
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "Book does not exist");
  }

  //Only creator of book can update it
  if (!book.userId.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this book");
  }
  const deletedBook = await Book.findOneAndDelete({
    _id: bookId,
  });

  if (!book) {
    throw new ApiError(404, "Book does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { deletedBook }, "Book deleted successfully"));
});
