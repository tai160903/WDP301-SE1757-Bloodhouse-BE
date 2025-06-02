"use strict";

const bloodRequestSupportModel = require("../models/bloodRequestSupport.model");
const userModel = require("../models/user.model");
const { NotFoundError, BadRequestError } = require("../configs/error.response");
const bloodRequestModel = require("../models/bloodRequest.model");
const donorUtils = require("../utils/donor");

class BloodRequestSupportService {
  // Tạo blood units từ blood donation (Doctor)
  createBloodRequestSupport = async (data, userId) => {
    const { phone, email, note, requestId } = data;

    // Check donor eligibility first
    await donorUtils.checkDonorEligibility(userId);

    const user = await userModel.findById(userId);
    const request = await bloodRequestModel.findById(requestId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    if (!request) {
      throw new NotFoundError("Không tìm thấy yêu cầu");
    }

    if (request.groupId.toString() !== user.bloodId.toString()) {
      throw new BadRequestError(
        "Nhóm máu của bạn không phù hợp với chiến dịch"
      );
    }

    const existingRegistration = await bloodRequestSupportModel.findOne({
      requestId,
      userId,
    });

    if (existingRegistration) {
      throw new BadRequestError("Bạn đã đăng ký chiến dịch này");
    }

    const bloodRequestSupport = await bloodRequestSupportModel.create({
      requestId,
      userId,
      phone,
      email,
      note,
    });
    return bloodRequestSupport;
  };

  getBloodRequestSupports = async () => {
    const bloodRequestSupports = await bloodRequestSupportModel.find();
    return bloodRequestSupports;
  };

  getBloodRequestSupportsByRequestId = async (requestId) => {
    const bloodRequest = await bloodRequestModel.findById(requestId);
    if (!bloodRequest) {
      throw new NotFoundError("Không tìm thấy yêu cầu");
    }

    const bloodRequestSupports = await bloodRequestSupportModel
      .find({
        requestId,
      })
      .populate({
        path: "userId",
        select: "email phone fullName bloodId avatar",
        populate: {
          path: "bloodId", // populate máu
          select: "name", // lấy tên nhóm máu
        },
      });

    // Gắn thông tin eligibility cho từng người
    const supportsWithEligibility = await Promise.all(
      bloodRequestSupports.map(async (support) => {
        let eligibilityInfo = null;
        try {
          eligibilityInfo = await donorUtils.checkDonorEligibility(
            support.userId._id
          );
        } catch (error) {
          eligibilityInfo = { isEligible: false, message: error.message };
        }

        return {
          ...support.toObject(),
          eligibility: eligibilityInfo,
        };
      })
    );
    return supportsWithEligibility;
  };

  updateBloodRequestSupportStatus = async (requestSupportId, status) => {
    const bloodRequestSupport = await bloodRequestSupportModel.findById(
      requestSupportId
    );
    if (!bloodRequestSupport) {
      throw new NotFoundError("Không tìm thấy đăng ký");
    }
    bloodRequestSupport.status = status;
    await bloodRequestSupport.save();
    return bloodRequestSupport;
  };
}

module.exports = new BloodRequestSupportService();
