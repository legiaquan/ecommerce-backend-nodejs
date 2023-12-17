"use strict";

const { StatusCodes, getReasonPhrase } = require("http-status-codes");

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatus = getReasonPhrase(StatusCodes.OK),
    metadata = {},
  }) {
    this.message = message || reasonStatus;
    this.status = statusCode;
    this.reasonStatus = reasonStatus;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor(message, metadata) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor(
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatus = getReasonPhrase(StatusCodes.CREATED),
    metadata
  ) {
    super({ message, statusCode, reasonStatus, metadata });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
