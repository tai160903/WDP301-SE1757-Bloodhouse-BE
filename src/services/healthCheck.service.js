"use strict";

const mongoose = require("mongoose");
const BloodDonationRegistration = require("../models/bloodDonationRegistration.model");
const User = require("../models/user.model");
const FacilityStaff = require("../models/facilityStaff.model");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../configs/error.response");
const { STAFF_POSITION } = require("../constants/enum");
const healthCheckModel = require("../models/healthCheck.model");

class HealthCheckService {
  // Nhân viên tạo đơn kiểm tra sức khỏe
  // Chỉ yêu cầu userId, doctorId, registrationId, checkDate; staffId lấy từ token
  createHealthCheck = async (
    { userId, doctorId, registrationId, checkDate },
    staffId
  ) => {
    // Step 1: Validate staff
    const staff = await FacilityStaff.findOne({
      _id: staffId,
      position: STAFF_POSITION.NURSE,
    });
    if (!staff) {
      throw new BadRequestError("Nhân viên không tồn tại hoặc không có quyền");
    }

    // Step 2: Validate required fields
    if (!registrationId || !userId || !checkDate || !doctorId) {
      throw new BadRequestError(
        "Thiếu registrationId, userId, checkDate hoặc doctorId"
      );
    }

    // Step 3: Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestError("registrationId không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("userId không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestError("doctorId không hợp lệ");
    }

    // Step 4: Check if registration, user, and doctor exist
    const registration = await BloodDonationRegistration.findById(
      registrationId
    );
    if (!registration) {
      throw new BadRequestError("Đăng ký hiến máu không tồn tại");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    const doctor = await FacilityStaff.findOne({
      _id: doctorId,
      position: STAFF_POSITION.DOCTOR,
    });
    if (!doctor) {
      throw new BadRequestError("Bác sĩ không tồn tại hoặc không có quyền");
    }

    // Step 5: Validate checkDate
    if (new Date(checkDate) > new Date()) {
      throw new BadRequestError("checkDate không được ở tương lai");
    }

    // Step 6: Create health check
    const healthCheck = await healthCheckModel.create({
      registrationId,
      userId,
      staffId,
      doctorId,
      checkDate: new Date(checkDate),
    });

    // Step 7: Populate and return
    const result = await healthCheck.populate([
      { path: "userId", select: "fullName email" },
      { path: "staffId", select: "position" },
      { path: "doctorId", select: "position" },
    ]);
    return {
      data: getInfoData({
        fields: [
          "_id",
          "registrationId",
          "userId",
          "doctorId",
          "staffId",
          "checkDate",
          "isEligible",
          "bloodPressure",
          "hemoglobin",
          "weight",
          "pulse",
          "temperature",
          "generalCondition",
          "deferralReason",
          "notes",
          "createdAt",
          "updatedAt",
        ],
        object: result,
      }),
    };
  };

  // Bác sĩ cập nhật thông tin kiểm tra sức khỏe
  // Chỉ cho phép cập nhật các trường: isEligible, bloodPressure, hemoglobin, weight, pulse, temperature, generalCondition, deferralReason, notes
  updateHealthCheck = async (id, reqBody) => {
    // Step 1: Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("ID kiểm tra sức khỏe không hợp lệ");
    }

    // Step 2: Find health check
    const healthCheck = await healthCheckModel.findById(id);
    if (!healthCheck) {
      throw new BadRequestError("Kiểm tra sức khỏe không tồn tại");
    }

    // Step 3: Update allowed fields
    const updateData = {
      isEligible:
        reqBody.isEligible !== undefined
          ? reqBody.isEligible
          : healthCheck.isEligible,
      bloodPressure: reqBody.bloodPressure || healthCheck.bloodPressure,
      hemoglobin: reqBody.hemoglobin || healthCheck.hemoglobin,
      weight: reqBody.weight || healthCheck.weight,
      pulse: reqBody.pulse || healthCheck.pulse,
      temperature: reqBody.temperature || healthCheck.temperature,
      generalCondition:
        reqBody.generalCondition || healthCheck.generalCondition,
      deferralReason: reqBody.deferralReason || healthCheck.deferralReason,
      notes: reqBody.notes || healthCheck.notes,
    };

    // Step 4: Validate isEligible and deferralReason
    if (updateData.isEligible === false && !updateData.deferralReason) {
      throw new BadRequestError(
        "Cần cung cấp lý do không đủ điều kiện (deferralReason)"
      );
    }
    if (updateData.isEligible === true && updateData.deferralReason) {
      updateData.deferralReason = null; // Xóa lý do không đủ điều kiện nếu đủ điều kiện
    }

    // Step 5: Update health check
    const updatedHealthCheck = await healthCheckModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedHealthCheck) {
      throw new BadRequestError("Cập nhật kiểm tra sức khỏe không thành công");
    }

    // Step 6: Populate and return
    const result = await updatedHealthCheck.populate([
      { path: "userId", select: "fullName email" },
      { path: "staffId", select: "position" },
      { path: "doctorId", select: "position" },
    ]);
    return {
      data: getInfoData({
        fields: [
          "_id",
          "registrationId",
          "userId",
          "doctorId",
          "staffId",
          "checkDate",
          "isEligible",
          "bloodPressure",
          "hemoglobin",
          "weight",
          "pulse",
          "temperature",
          "generalCondition",
          "deferralReason",
          "notes",
          "createdAt",
          "updatedAt",
        ],
        object: result,
      }),
    };
  };
}

module.exports = new HealthCheckService();
