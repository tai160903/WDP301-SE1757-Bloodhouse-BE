"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { ACCESS_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const authService = require("../services/auth.service");

class AuthController {
  signIn = asyncHandler(async (req, res, next) => {
    const result = await authService.signIn(req.body);
    new OK({ message: ACCESS_MESSAGE.LOGIN_SUCCESS, data: result }).send(res);
  });

  signUp = asyncHandler(async (req, res, next) => {
    const result = await authService.signUp(req.body);
    new CREATED({
      message: ACCESS_MESSAGE.REGISTER_SUCCESS,
      data: result,
    }).send(res);
  });

  signOut = asyncHandler(async (req, res, next) => {
    const result = await authService.signOut(req.user);
    new OK({ message: ACCESS_MESSAGE.LOGOUT_SUCCESS, data: result }).send(res);
  });


}

module.exports = new AuthController();
