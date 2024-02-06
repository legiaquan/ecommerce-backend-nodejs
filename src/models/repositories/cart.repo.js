"use strict";

const cartModel = require("../cart.model");
const { convertToObjectId } = require("../../utils");

const findCartById = async (cartId) => {
  return await cartModel
    .findOne({
      _id: convertToObjectId(cartId),
      cart_state: "active",
    })
    .lean();
};

module.exports = {
  findCartById,
};
