"use strict";

const apikeyModel = require("../models/apikey.model");

const findById = async (key) => {
  const objKey = apikeyModel.findOne({ key, status: true }).lean();

  return objKey;
};

module.exports = {
  findById,
};
