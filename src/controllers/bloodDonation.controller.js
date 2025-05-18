"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_DONATION_MESSAGE } = require("../constants/enum");
const asyncHandler = require("../helpers/asyncHandler");
const bloodDonationService = require("../services/bloodDonation.service");

class BloodDonationController {
  // Lấy lịch sử hiến máu của user
  getUserDonations = asyncHandler(async (req, res) => {
    const { limit, page } = req.query;
    const result = await bloodDonationService.getUserDonations(
      req.user.userId,
      parseInt(limit) || 10,
      parseInt(page) || 1
    );
    new OK({
      message: BLOOD_DONATION_MESSAGE.GET_SUCCESS,
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
      message: BLOOD_DONATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách hiến máu
  getBloodDonations = asyncHandler(async (req, res) => {
    const { status, facilityId, limit, page } = req.query;
    const result = await bloodDonationService.getBloodDonations({
      status,
      facilityId,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: BLOOD_DONATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

   // Lấy chi tiết một bản ghi hiến máu
  getBloodDonationDetail = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.getBloodDonationDetail(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    new OK({
      message: BLOOD_DONATION_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });
  }

module.exports = new BloodDonationController();