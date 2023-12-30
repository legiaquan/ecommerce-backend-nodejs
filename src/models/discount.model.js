"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "discount";
const COLLECTION = "discounts";

const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: {
      type: String,
      default: "fixed_amount",
      enum: ["fixed_amount", "percentage"],
    },
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // so lương duoc ap dung
    discount_uses_count: { type: Number, required: true }, // so discount da su dung
    discount_users_count: { type: Array, default: [] }, // user da su dung
    discount_max_uses_per_user: { type: Number, required: true }, // moi user duoc su dung toi da bao nhieu lan
    discount_min_order_value: { type: Number, required: true }, // don han toi thieu duoc su dung
    discount_shopId: { type: Schema.Types.ObjectId, required: true },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: { type: Array, default: [] }, // so san pham duoc ap dung
  },
  { timestamps: true, collection: COLLECTION }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
