"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "inventory";
const COLLECTION = "inventories";

const inventoriesSchema = new Schema(
  {
    inven_productId: { type: Schema.Types.ObjectId, ref: "product" },
    inven_location: { type: String, default: "unknown" },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: "shop" },
    inven_reservations: { type: Array, default: [] },
  },
  { timestamps: true, collection: COLLECTION }
);

module.exports = model(DOCUMENT_NAME, inventoriesSchema);
