import mongoose from "mongoose";


const cartmongooseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [
        {
          bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
          },
        },
      ],
      default: [],
    },
  },

  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartmongooseSchema);