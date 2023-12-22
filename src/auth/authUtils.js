"use strict";

const jwt = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = jwt.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("authUtils@createTokenPair: ", err);
      } else {
        console.log("decode verify: ", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("authUtils@createTokenPair: ", error);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  console.log('userId: ', userId);

  if (!userId) {
    return new AuthFailureError("Invalid request");
  }

  const keyStore = await findByUserId(userId);
  console.log("keyStore: ", keyStore);

  if (!keyStore) {
    return new NotFoundError("Not found keyStore");
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];

  if (!accessToken) {
    return new AuthFailureError("Invalid request");
  }
  try {
    const decoded = jwt.verify(accessToken, keyStore.publicKey);

    if (decoded.userId !== userId) {
      return new AuthFailureError("Invalid request");
    }

    req.keyStore = keyStore;
    req.user = decoded;
    console.log('decoded: ', decoded);

    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJwt = async (token, keySecret) => {
  return await jwt.verify(token, keySecret);
};

module.exports = { createTokenPair, authentication, verifyJwt };
