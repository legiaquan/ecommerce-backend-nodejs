"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const { authentication } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const ProductController = require("../../controllers/product.controller");
const router = express.Router();

router.get("/search/:keySearch", asyncHandler(ProductController.getListSearch));

router.get("/", asyncHandler(ProductController.findAllProducts));
router.get("/:product_id", asyncHandler(ProductController.findProduct));

// authenticate
router.use(authentication);

router.post("", asyncHandler(ProductController.createProduct));
router.patch("/:product_id", asyncHandler(ProductController.updateProduct));
router.post(
  "/publish/:id",
  asyncHandler(ProductController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(ProductController.unpublishProductByShop)
);

router.get("/drafts/all", asyncHandler(ProductController.findAllDraftsForShop));
router.get(
  "/publish/all",
  asyncHandler(ProductController.findAllPublishForShop)
);

module.exports = router;
