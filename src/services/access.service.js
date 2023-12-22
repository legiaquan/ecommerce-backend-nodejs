"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJwt } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const keytokenModel = require("../models/keytoken.model");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static handlerRefreshToken = async (refreshToken) => {
    const foundKey = await KeyTokenService.findByRefreshTokenUsed(refreshToken);

    // check token be used
    if (foundKey) {
      // check user
      const { userId, email } = await verifyJwt(
        refreshToken,
        foundKey.privateKey
      );

      await KeyTokenService.deleteByKey(foundKey.userId);

      throw new ForbiddenError('Some thing wrong happened!')
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if(!holderToken) {
      throw new AuthFailureError('Shop not registered')
    }

    const {userId, email} = await verifyJwt(refreshToken, holderToken.privateKey);

    const foundShop = await findByEmail({email});

    if(!foundShop) {
      throw new AuthFailureError('Shop not registered')
    }

    const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

    await keytokenModel.updateOne(
      { refreshToken: refreshToken },
      {
        $set: {
          refreshToken: tokens.refreshToken,
        },
        $addToSet: {
          refreshTokensUsed: tokens.refreshToken,
        },
      }
    );

    return {
      user: {userId, email},
      tokens
    }
  };
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeById(keyStore._id);

    return delKey;
  };
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    console.log('foundShop: ', foundShop);

    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }

    const match = bcrypt.compare(password, foundShop.password);

    if (!match) {
      throw new AuthFailureError("Authentication failed");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: Shop already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: RoleShop.SHOP,
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: "xxxx",
          message: "keyStore went error",
        };
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: newShop,
        }),
        tokens,
      };
    }

    return {
      metadata: null,
    };
  };
}

module.exports = AccessService;

