const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { findAllProductsRepo } = require("../models/repositories/product.repo");
const {
  fillAppDiscountCodesUnSelect,
  fillAppDiscountCodesSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { convertToObjectId } = require("../utils");

class DiscountService {
  static async createDiscount(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired!");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end_date!");
    }

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses, // so lương duoc ap dung
      discount_uses_count: uses_count, // so discount da su dung
      discount_max_uses_per_user: max_uses_per_user, // moi user duoc su dung toi da bao nhieu lan
      discount_min_order_value: min_order_value, // don han toi thieu duoc su dung
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids, // so san p
    });

    return newDiscount;
  }

  static async updateDiscountCode() {}

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let product = null;

    if (discount_applies_to === "all") {
      product = await findAllProductsRepo({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      product = await findAllProductsRepo({
        filter: {
          product_shop: { $in: discount_product_ids },
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return product;
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page }) {
    const discounts = await fillAppDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      select: ["discount_name", "discount_code"],
      model: discountModel,
    });

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount doesn't exist");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_count,
      discount_type,
      discount_value,
    } = foundDiscount;
    console.log("foundDiscount: ", foundDiscount);

    if (!discount_is_active) {
      throw new NotFoundError("Discount expired");
    }

    if (!discount_max_uses) {
      throw new NotFoundError("Discount are out!");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount code has expired!");
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + (product.quantity * product.price);
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount requires a minimum order value of ${discount_min_order_value}`
        );
      }

      if (discount_max_uses_per_user > 0) {
        const userUserDiscount = discount_users_count.find(
          (user) => user.userId === userId
        );

        if (userUserDiscount) {
          //
        }
      }
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });

    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount does not exist");
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
