import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import { ApiError } from "../utils/api-error.js";
import { Cart } from "../models/cart.models.js";
import { getCart } from "./cart.controllers.js";
import { PaymentProviderEnum } from "../utils/constants.js";
import { RazorpayError, RazorpayOrderType } from "../types/razorpay.js";
import { Order } from "../models/order.models.js";
import { Book } from "../models/book.models.js";
import { orderConfirmationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import mongoose from "mongoose";

let razorpayInstance: any;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("RAZORPAY ERROR: ", error);
}

export const generateRazorpayOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { address } = req.body;
    if (!razorpayInstance) {
      console.error("RAZORPAY ERROR: `key_id` is mandatory");
      throw new ApiError(500, "Internal server error");
    }

    const cart = await Cart.findOne({
      owner: req.user._id,
    });

    if (!cart || !cart.items?.length) {
      throw new ApiError(400, "User cart is empty");
    }
    const orderItems = cart.items;
    const userCart = await getCart(req.user._id);

    // note down th total cart value and cart value after the discount
    // If no coupon is applied the total and discounted prices will be the same
    const totalPrice = userCart.cartTotal;

    const orderOptions = {
      amount: parseInt(totalPrice) * 100, // in paisa
      currency: "INR", // Might accept from client
      receipt: nanoid(10),
    };

    razorpayInstance.orders.create(
      orderOptions,
      async function (
        err: RazorpayError | null,
        razorpayOrder: RazorpayOrderType
      ) {
        if (!razorpayOrder || (err && err.error)) {
          // Throwing ApiError here will not trigger the error handler middleware
          console.log(
            "err in razorpay ",
            orderOptions,
            razorpayOrder,
            " --- ",
            err
          );
          return res
            .status(err?.statusCode || 500)
            .json(
              new ApiResponse(
                err?.statusCode || 500,
                null,
                err?.error.reason ||
                  "Something went wrong while initialising the razorpay order."
              )
            );
        }

        // Create an order while we generate razorpay session
        // In case payment is done and there is some network issue in the payment verification api
        // We will at least have a record of the order
        const unpaidOrder = await Order.create({
          customer: req.user._id,
          items: orderItems,
          orderPrice: totalPrice ?? 0,
          address,
          paymentProvider: PaymentProviderEnum.RAZORPAY,
          paymentId: razorpayOrder.id,
        });
        if (unpaidOrder) {
          // if order is created then only proceed with the payment
          return res
            .status(200)
            .json(
              new ApiResponse(200, razorpayOrder, "Razorpay order generated")
            );
        } else {
          return res
            .status(500)
            .json(
              new ApiResponse(
                500,
                null,
                "Something went wrong while initialising the razorpay order."
              )
            );
        }
      }
    );
  }
);

/**
 *
 * @param {string} orderPaymentId
 * @param {import("express").Request} req
 * @description Utility function which is responsible for:
 * * Marking order payment done flag to true
 * * Clearing up the cart
 * * Calculate product's remaining stock
 * * Send mail to the user about order confirmation
 */
const orderFulfillmentHelper = async (orderPaymentId: string, req: Request) => {
  const order = await Order.findOneAndUpdate(
    {
      paymentId: orderPaymentId,
    },
    {
      $set: {
        isPaymentDone: true,
      },
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(404, "Order does not exist");
  }

  // Get the user's card
  const cart = await Cart.findOne({
    owner: req.user._id,
  });

  const userCart = await getCart(req.user._id);

  // Logic to handle product's stock change once order is placed
  let bulkStockUpdates = userCart.items.map(
    (item: { book: { _id: string }; quantity: number }) => {
      // Reduce the products stock
      return {
        updateOne: {
          filter: { _id: item.book?._id },
          update: { $inc: { stock: -item.quantity } }, // subtract the item quantity
        },
      };
    }
  );

  // * (bulkWrite()) is faster than sending multiple independent operations (e.g. if you use create())
  // * because with bulkWrite() there is only one network round trip to the MongoDB server.
  await Book.bulkWrite(bulkStockUpdates, {
    skipValidation: true,
  });

  await sendEmail({
    email: req.user?.email,
    subject: "Order confirmed",
    mailgenContent: orderConfirmationMailgenContent(
      req.user?.username,
      userCart.items,
      order.orderPrice ?? 0 // send discounted price in the mail which is paid by the user
    ),
  });

  cart.items = []; // empty the cart
  cart.coupon = null; // remove the associated coupon

  await cart.save({ validateBeforeSave: false });
  return order;
};

export const verifyRazorpayPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    let expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await orderFulfillmentHelper(razorpay_order_id, req);
      return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
    } else {
      throw new ApiError(400, "Invalid razorpay signature");
    }
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: orderId } = req.params;

    const order = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId),
          customer: req.user._id,
        },
      },
      //lookup for cusomer
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
              },
            },
          ],
        },
      },
      //lookup returns an array so get first value
      {
        $addFields: {
          customer: { $first: "$customer" },
        },
      },
      //now unwind items
      {
        $unwind: "$items",
      },
      //now lookup in items after unwind
      {
        $lookup: {
          from: "books",
          localField: "items.bookId",
          foreignField: "_id",
          as: "items.book",
        },
      },
      //so now this lookup will also return an array
      //so extract first item from it
      {
        $addFields: {
          "items.book": { $first: "$items.book" },
        },
      },
      //now group them into desired form
      {
        $group: {
          _id: "$_id",
          order: { $first: "$$ROOT" },
          orderItems: {
            $push: {
              _id: "$items._id",
              quantity: "$items.quantity",
              book: "$items.book",
            },
          },
        },
      },
      {
        $addFields: {
          "order.items": "$orderItems",
        },
      },
      {
        $project: {
          orderItems: 0,
        },
      },
    ]);

    if (!order[0]) {
      throw new ApiError(404, "Order does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, order[0], "Order fetched successfully"));
  }
);

export const getCustomerAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.aggregate([
      {
        $match: {
          customer: req.user._id,
        },
      },
      {
        $addFields: {
          totalOrderItems: { $size: "$items" },
        },
      },
      {
        $project: {
          items: 0,
          customer: 0,
        },
      },
    ]);

    if (!order[0]) {
      throw new ApiError(404, "No order found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, order[0], "Orders fetched successfully"));
  }
);
