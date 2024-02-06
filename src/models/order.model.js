"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "order";
const COLLECTION = "orders";

const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: {} },
    order_shipping: { type: Object, default: {} },
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: "0000123123" },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancel", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true, collection: COLLECTION }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
