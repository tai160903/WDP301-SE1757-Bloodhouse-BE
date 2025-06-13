"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const userBadgeService = require("../services/userBadge.service");
const { USER_BADGE_MESSAGE } = require("../constants/message");

class UserBadgeController {
  // Lấy logs theo registration ID
  getUserBadges = asyncHandler(async (req, res) => {
    const result = await userBadgeService.getUserBadges(req.user.userId);
    
    new OK({
      message: USER_BADGE_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new UserBadgeController(); 