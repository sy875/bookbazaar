import mongoose, { Schema } from "mongoose";
import { AvailableGenres } from "../utils/constants.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    genre: {
      type: String,
      enum: AvailableGenres,
      required: true,
    },
    bookCoverImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: [50, "Price cannot be below 50"],
      max: [10000, "Price cannot exceed 100"],
      required: true,
    },
    stock: {
      type: Number,
      min: [1, "Price cannot be below 50"],
      max: [100, "Price cannot exceed 100"],
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

bookSchema.plugin(mongooseAggregatePaginate);

export const Book = mongoose.model("Book", bookSchema);
// ■ {
// ■ "id": "auto-generated UUID",
// ■ "title": "String",
// ■ "author": "String",
// ■ "genre": "String",
// ■ "publishedYear": Number,
// ■ "userId": "ID of user who added the book"
// ■ }
