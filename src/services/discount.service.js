const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { findAllProductsRepo } = require("../models/repositories/product.repo");
const {
  fillAppDiscountCodesUnSelect,
  fillAppDiscountCodesSelect,
} = require("../models/repositories/discount.repo");

class DiscountService {
  static async createDiscountCode(payload) {
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
        discount_shop: convertToObjectIdentifier(shopId),
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
        discount_shop: convertToObjectIdentifier(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    if (discount_applies_to === "all") {
      product = await findAllProductsRepo({
        filter: {
          product_shop: convertToObjectIdentifier(shopId),
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

    return products;
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page }) {
    const discounts = await fillAppDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdentifier(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });
  }
}
