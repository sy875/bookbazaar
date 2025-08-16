import mongoose from "mongoose";
import {
  AvailablePaymentProviders,
  AvailablePaymentStatuses,
  PaymentProviderEnum,
  PaymentStatusEnum,
} from "../utils/constants.js";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: AvailablePaymentProviders,
      default: PaymentProviderEnum.UNKNOWN,
    },
    paymentId: {
      type: String, // From the gateway
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: AvailablePaymentStatuses,
      default: PaymentStatusEnum.PENDING,
    },
    failureReason: {
      type: String,
    },
    gatewayResponse: {
      type: Object,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
