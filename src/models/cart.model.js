"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "cart";
const COLLECTION = "carts";

const cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    cart_products: { type: Array, required: true, default: [] },
    cart_count_product: { type: Number, default: 0 },
    cart_userId: { type: String, required: true },
  },
  { timestamps: true, collection: COLLECTION }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
