"use strict";

const express = require("express");
const { authentication } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();

router.post("/amount", asyncHandler(discountController.getAllDiscountAmount));
router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodesWithProduct)
);

router.use(authentication);

router.post("/", asyncHandler(discountController.createDiscount));
router.get("/", asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
