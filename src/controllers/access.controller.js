"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    }).send(res);
  }

  login = async (req, res, next) => {
    console.log(`[P]:::login: `, req.body);
    return new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  logout = async (req, res, next) => {
    console.log(`[P]:::logout: `, req.body);
    return new SuccessResponse({
      message: "Logout successfully",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    console.log(`[P]:::signUp: `, req.body);

    return new CREATED({
      message: "Registered successfully",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
