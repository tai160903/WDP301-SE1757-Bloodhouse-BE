"use strict";

const emergencyCampaignModel = require("../models/emergencyCampaign.model");
const bloodRequestModel = require("../models/bloodRequest.model");
const userModel = require("../models/user.model");
const notificationService = require("./notification.service");
const { BLOOD_REQUEST_STATUS } = require("../constants/enum");

class EmergencyCampaignService {
  createEmergencyCampaign = async (userId, { requestId, deadline, note }) => {
    const request = await bloodRequestModel
      .findById(requestId)
      .populate("groupId")
      .populate("componentId")
      .populate("userId")
      .populate("facilityId");

    if (!request) {
      throw new Error("Yêu cầu không tồn tại");
    }

    // Tìm những người hiến máu phù hợp (isAvailable = true và nhóm máu phù hợp)
    const availableDonors = await userModel.find({
      isAvailable: true,
      bloodId: request.groupId._id,
    });

    // Tạo chiến dịch khẩn cấp
    const emergencyCampaign = await emergencyCampaignModel.create({
      requestId,
      facilityId: request.facilityId._id,
      quantityNeeded: request.quantity,
      deadline,
      note,
      createdBy: userId,
    });

    // Gửi thông báo cho từng người hiến máu phù hợp
    if (availableDonors.length > 0) {
      const notificationPromises = availableDonors.map((donor) =>
        notificationService.sendEmergencyRequestNotification(
          donor._id,
          request.groupId.name,
          request.componentId.name,
          request.quantity,
          request.facilityId.name,
          emergencyCampaign._id
        )
      );

      await Promise.all(notificationPromises);
    }

    // Cập nhật trạng thái yêu cầu máu thành đã duyệt
    request.status = BLOOD_REQUEST_STATUS.APPROVED;
    request.hasCampaign = true;
    await request.save();

    return {
      campaign: emergencyCampaign,
      notifiedDonors: availableDonors.length,
    };
  };

  getAllEmergencyCampaigns = async () => {
    const emergencyCampaigns = await emergencyCampaignModel
      .find()
      .populate("requestId")
      .populate({
        path: "facilityId",
        populate: {
          path: "mainImage",
          match: { isMain: true },
        },
      })
      .populate("createdBy");
    return emergencyCampaigns;
  };

  getEmergencyCampaignById = async (id) => {
    const emergencyCampaign = await emergencyCampaignModel
      .findById(id)
      .populate("requestId")
      .populate("facilityId")
      .populate("createdBy");
    return emergencyCampaign;
  };

  updateEmergencyCampaign = async (id, { status, quantityNeeded }) => {
    const emergencyCampaign = await emergencyCampaignModel.findByIdAndUpdate(
      id,
      { status, quantityNeeded },
      { new: true }
    );
    return emergencyCampaign;
  };

  getFacilityEmergencyCampaigns = async (facilityId) => {
    const emergencyCampaigns = await emergencyCampaignModel
      .find()
      .populate({
        path: "requestId",
        match: { facilityId: facilityId },
      })
      .populate("createdBy");

    // Lọc ra những campaign có requestId còn tồn tại (tức là match được facilityId)
    const filteredCampaigns = emergencyCampaigns.filter(
      (campaign) => campaign.requestId !== null
    );

    return filteredCampaigns;
  };
}

module.exports = new EmergencyCampaignService();
