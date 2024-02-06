"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updatedOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cartModel.create(query, updatedOrInsert, options);
  }
  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_product.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }
  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({ cart_userId: userId });
    console.log("userCart: ", userCart);

    if (!userCart) {
      return await CartService.createUserCart({ userId, product });
    }

    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];

      return await userCart.save();
    }

    return await CartService.updateUserCartQuantity({ userId, product });
  }
  static async addToCartV2({ userId, shop_order_ids }) {
    console.log("shop_order_ids: ", shop_order_ids);
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    const foundProduct = await getProductById(productId);

    if (!foundProduct) {
      throw new NotFoundError("Product not exist");
    }

    if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
      throw new NotFoundError("Product do not belong o the shop");
    }

    if (quantity === 0) {
      // delete
    }

    return await CartService.updateUserCartQuantity({
      cart_userId: userId,
      cart_products: [
        {
          productId,
          quantity: quantity - old_quantity,
        },
      ],
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cartModel.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
