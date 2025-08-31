import { Request, Response } from "express";
import { Cart } from "../models/cart.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Book } from "../models/book.models.js";

export const getCart = async (userId: string) => {
  const cartAggregation = await Cart.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "books",
        localField: "items.bookId",
        foreignField: "_id",
        as: "book",
        pipeline: [
          {
            $project: {
              title: 1,
              author: 1,
              genre: 1,
              description: 1,
              bookCoverImage: 1,
              price: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        book: { $first: "$book" },
        quantity: "$items.quantity",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$$ROOT",
        },
        cartTotal: {
          $sum: {
            $multiply: ["$book.price", "$quantity"],
          },
        },
      },
    },
  ]);

  return (
    cartAggregation[0] ?? {
      _id: null,
      items: [],
      cartTotal: 0,
    }
  );
};

export const getUserCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await getCart(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

export const addItemOrUpdateItemQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;
    const { quantity = 1 } = req.body;

    // fetch user cart
    const cart = await Cart.findOneAndUpdate(
      { owner: req.user._id },
      { $setOnInsert: { owner: req.user._id, items: [] } },
      { new: true, upsert: true }
    );
 

    // See if book that user is adding exist in the db
    const book = await Book.findById(bookId);

    if (!book) {
      throw new ApiError(404, "Book does not exist");
    }

    // If book is there check if the quantity that user is adding is less than or equal to the book's stock
    if (quantity > book.stock) {
      // if quantity is greater throw an error
      throw new ApiError(
        400,
        book.stock > 0
          ? "Only " +
            book.stock +
            " book are remaining. But you are adding " +
            quantity
          : "book is out of stock"
      );
    }

    // See if the book that user is adding already exists in the cart
    const addedProduct = cart?.items?.find(
      (item: { bookId: string }) => item.bookId.toString() === bookId
    );

    if (addedProduct) {
      // If book already exist assign a new quantity to it
      // ! We are not adding or subtracting quantity to keep it dynamic. Frontend will send us updated quantity here
      addedProduct.quantity = quantity;
    } else {
      // if its a new book being added in the cart push it to the cart items
      cart?.items?.push({
        bookId,
        quantity,
      });
    }

    // Finally save the cart
    await cart.save({ validateBeforeSave: true });

    const newCart = await getCart(req.user._id); // structure the user cart

    return res
      .status(200)
      .json(new ApiResponse(200, newCart, "Item added successfully"));
  }
);

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);

    // check for book existence
    if (!book) {
      throw new ApiError(404, "Book does not exist");
    }

    const updatedCart = await Cart.findOneAndUpdate(
      {
        owner: req.user._id,
      },
      {
        // Pull the book inside the cart items
        // ! We are not handling decrement logic here that's we are doing in addItemOrUpdateItemQuantity method
        // ! this controller is responsible to remove the cart item entirely
        $pull: {
          items: {
            bookId: bookId,
          },
        },
      },
      { new: true }
    );

    let cart = await getCart(req.user._id);

    // check if the cart's new total is greater than the minimum cart total requirement of the coupon
    if (cart.coupon && cart.cartTotal < cart.coupon.minimumCartValue) {
      // if it is less than minimum cart value remove the coupon code which is applied
      updatedCart.coupon = null;
      await updatedCart.save({ validateBeforeSave: false });
      // fetch the latest updated cart
      cart = await getCart(req.user._id);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart item removed successfully"));
  }
);

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await Cart.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        items: [],
      },
    },
    { new: true }
  );
  const cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart has been cleared"));
});
