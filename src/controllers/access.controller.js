"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { ACCESS_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");

class AccessController {
  signIn = asyncHandler(async (req, res, next) => {
    const result = 'signIn'
    new OK({ message: ACCESS_MESSAGE.LOGIN_SUCCESS, data: result }).send(res);
  });

  signUp = asyncHandler(async (req, res, next) => {
    const result = 'signUp'
    new CREATED({
      message: ACCESS_MESSAGE.REGISTER_SUCCESS,
      data: result,
    }).send(res);
  });

  signOut = asyncHandler(async (req, res, next) => {
    const result = 'signOut'
    new OK({ message: ACCESS_MESSAGE.LOGOUT_SUCCESS, data: result }).send(res);
  });


}

module.exports = new AccessController();
