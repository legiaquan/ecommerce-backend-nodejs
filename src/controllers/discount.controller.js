"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    return new SuccessResponse({
      message: "Successful Code Generation",
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    return new SuccessResponse({
      message: "Successful Code Found",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountAmount = async (req, res, next) => {
    return new SuccessResponse({
      message: "Successful Code Found",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodesWithProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Successful Code Found",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
