"use strict";

const badgeModel = require("../models/badge.model");
const userBadgeModel = require("../models/userBadge.model");

class BadgeService {
  checkAndAssignBadges = async (userId, donationCount) => {
    const badges = await badgeModel.find({
      $or: [
        {
          "criteria.type": "donation_count",
          "criteria.value": { $lte: donationCount },
        },
        { "criteria.type": "first_donation" },
      ],
    });

    // Kiểm tra điều kiện của từng badge
    const grantedBadges = [];

    for (const badge of badges) {
      const already = await userBadgeModel.exists({
        userId,
        badgeId: badge._id,
      });
      if (already) continue;
      if (
        badge.criteria.type === "donation_count" &&
        badge.criteria.value <= donationCount
      ) {
        await userBadgeModel.create({ userId, badgeId: badge._id });
        grantedBadges.push(badge);
      }

      if (badge.criteria.type === "first_donation" && donationCount === 1) {
        await userBadgeModel.create({ userId, badgeId: badge._id });
        grantedBadges.push(badge);
      }
    }

    return grantedBadges;
  };
}

module.exports = new BadgeService();
