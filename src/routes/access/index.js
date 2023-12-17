"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const { authentication } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.post("/shop/signup", asyncHandler(AccessController.signUp));
router.post("/shop/login", asyncHandler(AccessController.login));

// authenticate
router.use(authentication);

router.post("/shop/logout", asyncHandler(AccessController.logout));

module.exports = router;
