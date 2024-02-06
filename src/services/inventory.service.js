"use strict";

const { BadRequestError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "123 Tran Phu",
  }) {
    const product = await getProductById(productId);

    if (!product) {
      throw new BadRequestError("The product does not exist");
    }

    const query = {
        inven_shopId: shopId,
        inven_productId: productId,
      },
      updateSet = {
        $inc: {
          inven_stock: stock,
        },
        $set: {
          inven_location: location,
        },
      },
      options = {
        upsert: true,
        new: true,
      };

    return await inventoryModel.updateOne(query, updateSet);
  }
}

module.exports = InventoryService;
