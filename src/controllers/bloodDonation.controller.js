"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodService = require("../services/bloodRequest.service");

class BloodDonationController {
  // Đăng ký hiến máu
  createBloodDonationRegistration = asyncHandler(async (req, res) => {
    const result = await bloodService.createBloodDonationRegistration({
      userId: req.user._id,
      ...req.body,
    });
    new CREATED({
      message: "Blood donation registration created successfully",
      data: result,
    }).send(res);
  });

  // Lấy danh sách đăng ký hiến máu
  getBloodDonationRegistrations = asyncHandler(async (req, res) => {
    const { status, facilityId, limit, page } = req.query;
    const result = await bloodService.getBloodDonationRegistrations({
      status,
      facilityId,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: "Blood donation registrations retrieved successfully",
      data: result,
    }).send(res);
  });

  // Phê duyệt đăng ký hiến máu
  approveBloodDonationRegistration = asyncHandler(async (req, res) => {
    const result = await bloodService.approveBloodDonationRegistration(
      req.params.id,
      req.user._id,
      req.body.status
    );
    new OK({
      message: "Blood donation registration updated successfully",
      data: result,
    }).send(res);
  });

  // Lấy lịch sử hiến máu của user
  getUserDonations = asyncHandler(async (req, res) => {
    const { limit, page } = req.query;
    const result = await bloodService.getUserDonations(
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
    const result = await bloodService.createBloodDonation({
      staffId: req.user._id,
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