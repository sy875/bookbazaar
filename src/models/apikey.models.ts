import mongoose from "mongoose";
import { User } from "./user.models.js";

const ApiKeysSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const ApiKey = mongoose.model("ApiKeysSchema", ApiKeysSchema);
