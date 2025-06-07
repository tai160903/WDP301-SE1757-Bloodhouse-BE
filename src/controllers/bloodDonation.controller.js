"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_DONATION_MESSAGE } = require("../constants/message");
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
    const staffId = req.user.staffId
    const result = await bloodDonationService.createBloodDonation({
      staffId,
      ...req.body,
    });
    new CREATED({
      message: BLOOD_DONATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Cập nhật bản ghi hiến máu (PATCH)
  updateBloodDonation = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.updateBloodDonation({
      donationId: req.params.id,
      staffId: req.user.staffId,
      ...req.body,
    });
    new OK({
      message: BLOOD_DONATION_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Chuyển sang giai đoạn nghỉ ngơi
  transitionToResting = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.transitionToResting({
      registrationId: req.params.registrationId,
      staffId: req.user.staffId,
      notes: req.body.notes,
    });
    new OK({
      message: BLOOD_DONATION_MESSAGE.TRANSITION_TO_RESTING_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách hiến máu
  getBloodDonations = asyncHandler(async (req, res) => {
    const { status, limit, page } = req.query;

    const result = await bloodDonationService.getBloodDonations({
      status,
      facilityId: req.user.facilityId,
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

  // Lấy blood donation theo health check id
  getBloodDonationByHealthCheckId = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.getBloodDonationByHealthCheckId(
      req.params.healthCheckId,
      req.user.userId,
      req.user.role
    );
    new OK({
      message: BLOOD_DONATION_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách blood donation theo doctorId (sử dụng staffId từ token)
  getBloodDonationsByDoctorId = asyncHandler(async (req, res) => {
    const { status, isDivided, limit, page } = req.query;
    const result = await bloodDonationService.getBloodDonationsByDoctorId({
      doctorId: req.user.staffId, 
      status,
      isDivided,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: BLOOD_DONATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Mark blood donation as divided (Doctor)
  markBloodDonationAsDivided = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.markBloodDonationAsDivided({
      donationId: req.params.id,
      doctorId: req.user.staffId,
    });
    new OK({
      message: BLOOD_DONATION_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Nurse QR scan to get blood donation details
  processNurseQRScanForDonation = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.processNurseQRScanForDonation({
      qrData: req.body.qrData,
      nurseId: req.user.staffId,
    });
    new OK({
      message: "Quét QR thành công",
      data: result,
    }).send(res);
  });
}

module.exports = new BloodDonationController();