"use strict";

const { findById } = require("../services/apikey.sevice");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "x-authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();

    if (!key) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    const objKey = await findById(key);
    console.log("objKey: ", objKey);

    if (!objKey) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    req.objKey = objKey;

    next();
  } catch (error) {
    return error;
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({ message: "permission denied" });
    }

    console.log("permissions:: ", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    console.log("validPermission: ", validPermission);

    if (!validPermission) {
      return res.status(403).json({ message: "permission denied" });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
