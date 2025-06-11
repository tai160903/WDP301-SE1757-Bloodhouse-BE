"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodDonationService = require("../services/bloodDonation.service");
const { BLOOD_DONATION_REGISTRATION_MESSAGE } = require("../constants/message");

class BloodDonationRegistrationController {
  // Đăng ký hiến máu
  createBloodDonationRegistration = asyncHandler(async (req, res) => {
    console.log(req.body);
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
      changedBy: req.user.staffId,
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
        req.user.userId,
        req.user.role,
        req.user.staffId
      );
    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  // API cho NURSE: Lấy danh sách đăng ký hiến máu được gán cho mình
  getStaffAssignedRegistrations = asyncHandler(async (req, res) => {
    const {
      status,
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      bloodGroupId,
    } = req.query;

    const result = await bloodDonationService.getStaffAssignedRegistrations({
      staffId: req.user.staffId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      startDate,
      endDate,
      bloodGroupId,
    });

    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // API cho MANAGER, NURSE: Lấy danh sách đăng ký hiến máu của facility với thống kê
  getFacilityRegistrations = asyncHandler(async (req, res) => {
    const {
      status,
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      bloodGroupId,
      staffId,
      includeStats = false,
    } = req.query;

    const result = await bloodDonationService.getFacilityRegistrations({
      facilityId: req.user.facilityId, // Lấy từ staff info trong token
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      startDate,
      endDate,
      bloodGroupId,
      staffId,
      includeStats: includeStats === "true",
    });

    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // API cho MANAGER: Lấy thống kê tổng quan về đăng ký hiến máu
  getRegistrationStatistics = asyncHandler(async (req, res) => {
    const {
      startDate,
      endDate,
      groupBy = "day", // day, week, month
    } = req.query;

    const result = await bloodDonationService.getRegistrationStatistics({
      facilityId: req.user.facilityId,
      startDate,
      endDate,
      groupBy,
    });

    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.GET_STATISTICS_SUCCESS,
      data: result,
    }).send(res);
  });

  // API cho STAFF: Cập nhật trạng thái check-in qua QR code
  updateCheckInStatus = asyncHandler(async (req, res) => {
    const { qrData } = req.body;

    const result = await bloodDonationService.processCheckIn({
      qrData,
      staffId: req.user.staffId,
    });

    new OK({
      message: BLOOD_DONATION_REGISTRATION_MESSAGE.CHECK_IN_SUCCESS,
      data: result,
    }).send(res);
  });

  // Doctor QR scan to get health check details
  processDoctorQRScan = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.processDoctorQRScan({
      qrData: req.body.qrData,
      doctorId: req.user.staffId,
    });
    new OK({
      message: "Quét QR thành công",
      data: result,
    }).send(res);
  });

  // Nurse smart scan - comprehensive QR analysis for nurse workflow
  processNurseSmartScan = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.processNurseSmartScan({
      qrData: req.body.qrData,
      nurseId: req.user.staffId,
    });
    new OK({
      message: "Smart scan thành công",
      data: result,
    }).send(res);
  });

  // Nurse QR scan for gift distribution after completed donations
  processNurseGiftScan = asyncHandler(async (req, res) => {
    const result = await bloodDonationService.processNurseGiftScan({
      qrData: req.body.qrData,
      nurseId: req.user.staffId,
    });
    new OK({
      message: "Gift scan thành công",
      data: result,
    }).send(res);
  });
}

module.exports = new BloodDonationRegistrationController();
