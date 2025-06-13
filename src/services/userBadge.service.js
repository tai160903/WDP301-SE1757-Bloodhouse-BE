"use strict";

const userBadgeModel = require("../models/userBadge.model");

class UserBadgeService {
  getUserBadges = async (userId) => {
    const userBadges = await userBadgeModel
      .find({ userId })
      .populate("badgeId")
      .sort({ earnedAt: -1 })
      .lean();
    return userBadges;
  };
}

module.exports = new UserBadgeService();
