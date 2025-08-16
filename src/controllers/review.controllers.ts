import mongoose from "mongoose";
import { Book } from "../models/book.models.js";
import { Review } from "../models/review.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Request, Response } from "express";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;
    const { rating, comment } = req.body;
    const isBookExist = await Book.findById(bookId);
    if (!isBookExist) {
      throw new ApiError(404, "Book does not exist");
    }
    const isReviewExist = await Review.findOne({
      book: bookId,
      user: req.user._id,
    });
    if (isReviewExist) {
      throw new ApiError(409, "Review already exist");
    }
    const review = await Review.create({
      rating,
      comment,
      book: bookId,
      user: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  }
);

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;

  const reviews = await Review.aggregate([
    {
      $match: { book: new mongoose.Types.ObjectId(bookId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        book: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(201, reviews, "Review fetched successfully"));
});

export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: reviewId } = req.params;

    //only allow owner to delete the review
    const review = await Review.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(reviewId),
      user: req.user._id,
    });

    if (!review) {
      throw new ApiError(404, "Review does not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedReview: review },
          "Review deleted successfully"
        )
      );
  }
);
