"use strict";

const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    const foundCart = await findCartById(cartId);

    if (!foundCart) {
      throw new BadRequestError("Cart not exist");
    }

    const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discount = [],
        item_products = [],
      } = shop_order_ids_new[i];
      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductByServer[0]) {
        throw new BadRequestError("Order wrong!!!");
      }

      const checkoutPrice = checkProduceServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      });

      checkout_order.totalPrice = checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      if (shop_discounts.length > 0) {
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkoutProductServer,
        });

        checkout_order.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout = itemCheckout.priceApplyDiscount;

      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids_new,
    cartId,
    userId,
    user_address = [],
    user_payment = [],
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    const products = shop_order_ids_new.flatMap((order) => order.item_products);

    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock);

      if (keyLock) {
        await releaseLock(keyLock);
      }

      const newOrder = await orderModel.create({
        order_userId: userId,
        order_checkout: checkout_order,
        order_shipping: user_address,
        order_payment: user_payment,
        order_products: products,
      });

      if (newOrder) {
      }

      return newOrder;
    }
  }

  static async getOrderByUse() {}

  static async getOneOrderByUse() {}

  static async cancelOrderByUse() {}

  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
