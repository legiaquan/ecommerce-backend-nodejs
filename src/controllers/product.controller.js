"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class AccessController {
  createProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Create new product success!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Publish product for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {Json}
   */
  publishProductByShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Publish product success!",
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unpublishProductByShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Publish product success!",
      metadata: await ProductService.unpublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {Json}
   */
  findAllDraftsForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Find all product success!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Get all Publish for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {Json}
   */
  findAllPublishForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Find all product success!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearch = async (req, res, next) => {
    return new SuccessResponse({
      message: "Find all product success!",
      metadata: await ProductService.searchProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    return new SuccessResponse({
      message: "Find all product success!",
      metadata: await ProductService.findAllProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Find product success!",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Update product success!",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.product_id,
        { ...req.body, product_shop: req.user.userId }
      ),
    }).send(res);
  };
}

module.exports = new AccessController();
