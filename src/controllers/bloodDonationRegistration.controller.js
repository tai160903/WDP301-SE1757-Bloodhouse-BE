"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodDonationService = require("../services/bloodDonation.service");
const { BLOOD_DONATION_REGISTRATION_MESSAGE } = require("../constants/message");
class BloodDonationRegistrationController {
  // Đăng ký hiến máu
  createBloodDonationRegistration = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.createBloodDonationRegistration({
      userId: req.user.userId,
      ...req.body,
    });
    new CREATED({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách đăng ký hiến máu
  getBloodDonationRegistrations = asyncHandler(async (req, res) => {
    const { status, facilityId, limit, page } = req.query;
    const result = await bloodDonationService.getBloodDonationRegistrations({
      status,
      facilityId,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Phê duyệt đăng ký hiến máu
  updateBloodDonationRegistration = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.updateBloodDonationRegistration({
      registrationId: req.params.id,
      ...req.body,
    });
    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.APPROVE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách đăng ký hiến máu của người dùng
  getUserBloodDonationRegistrations = asyncHandler(async (req, res) => {
    const { status, limit, page } = req.query;
    const result = await bloodDonationService.getUserBloodDonationRegistrations(
      req.user.userId,
      {
        status,
        limit: parseInt(limit) || 10,
        page: parseInt(page) || 1,
      }
    );
    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy chi tiết một đăng ký hiến máu
  getBloodDonationRegistrationDetail = asyncHandler(async (req, res) => {
    const result =
      await bloodDonationService.getBloodDonationRegistrationDetail(
        req.params.id,
        req.user.userId
      );
    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new BloodDonationRegistrationController();
