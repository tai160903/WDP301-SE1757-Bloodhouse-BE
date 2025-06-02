"use strict";

const userModel = require("../models/user.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const { BadRequestError } = require("../configs/error.response");

const donorUtils = {
  checkDonorEligibility: async (userId) => {
    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }

    // Check if user is available for donation
    if (!user.isAvailable) {
      throw new BadRequestError("Người dùng chưa sẵn sàng hiến máu");
    }

    // Lấy tất cả các lần hiến máu
    const donations = await bloodDonationModel
      .find({ userId })
      .sort({ donationDate: -1 }); // Lần gần nhất ở đầu

    const totalDonations = donations.length;
    const lastDonation = donations[0] || null;

    if (lastDonation) {
      const lastDonationDate = new Date(lastDonation.donationDate);
      const currentDate = new Date();
      const monthsDiff =
        (currentDate.getFullYear() - lastDonationDate.getFullYear()) * 12 +
        (currentDate.getMonth() - lastDonationDate.getMonth());

      // Check waiting period based on gender
      const requiredMonths = user.gender === "female" ? 4 : 3;
      if (monthsDiff < requiredMonths) {
        throw new BadRequestError(
          `Bạn cần đợi đủ ${requiredMonths} tháng kể từ lần hiến máu trước (${lastDonationDate.toLocaleDateString(
            "vi-VN"
          )})`
        );
      }
    }

    // All checks passed
    return {
      isEligible: true,
      message: "Đủ điều kiện hiến máu",
      totalDonations,
      lastDonationDate: lastDonation?.donationDate || null,
    };
  },
};

module.exports = donorUtils;
