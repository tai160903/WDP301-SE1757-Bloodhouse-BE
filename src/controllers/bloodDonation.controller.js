"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodDonationService = require("../services/bloodDonation.service");

class BloodDonationController {
  // Lấy lịch sử hiến máu của user
  getUserDonations = asyncHandler(async (req, res) => {
    const { limit, page } = req.query;
    const result = await bloodDonationService.getUserDonations(
      req.params.id,
      parseInt(limit) || 10,
      parseInt(page) || 1
    );
    new OK({
      message: "User donations retrieved successfully",
      data: result,
    }).send(res);
  });

  // Tạo bản ghi hiến máu
  createBloodDonation = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.createBloodDonation({
      staffId: req.user.userId,
      ...req.body,
    });
    new CREATED({
      message: "Blood donation created successfully",
      data: result,
    }).send(res);
  });

  // Lấy danh sách hiến máu
  getBloodDonations = asyncHandler(async (req, res) => {
    const { status, facilityId, limit, page } = req.query;
    const result = await bloodService.getBloodDonations({
      status,
      facilityId,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: "Blood donations retrieved successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new BloodDonationController();