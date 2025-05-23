"use strict";

const emergencyCampaignModel = require("../models/emergencyCampaign.model");
const bloodRequestModel = require("../models/bloodRequest.model");
const userModel = require("../models/user.model");
const notificationService = require("./notification.service");

class EmergencyCampaignService {
  createEmergencyCampaign = async (userId, { requestId }) => {
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
      quantityNeeded: request.quantity,
      createdBy: userId,
    });

    // Gửi thông báo cho từng người hiến máu phù hợp
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

    return {
      campaign: emergencyCampaign,
      notifiedDonors: availableDonors.length,
    };
  };

  getEmergencyCampaigns = async () => {
    const emergencyCampaigns = await emergencyCampaignModel
      .find()
      .populate("requestId")
      .populate("facilityId")
      .populate("createdBy");
    return emergencyCampaigns;
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
      .find({ facilityId })
      .populate("requestId")
      .populate("facilityId")
      .populate("createdBy");
    return emergencyCampaigns;
  };
}

module.exports = new EmergencyCampaignService();
