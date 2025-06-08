"use strict";

const donorStatusLogModel = require("../models/donorStatusLog.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const {
  DONOR_STATUS,
  BLOOD_DONATION_REGISTRATION_STATUS,
} = require("../constants/enum");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const processDonationLogService = require("./processDonationLog.service");
const userModel = require("../models/user.model");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const notificationService = require("./notification.service");

class DonorStatusLogService {
  // Tạo bản ghi trạng thái người hiến
  createDonorStatusLog = async ({ donationId, userId, staffId }) => {
    // Kiểm tra donation có tồn tại không
    const donation = await bloodDonationModel.findById(donationId);
    if (!donation) {
      throw new NotFoundError("Bản ghi hiến máu không tồn tại");
    }

    // Kiểm tra user có tồn tại không
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    // Cập nhật trạng thái đăng ký hiến máu
    const registration = await bloodDonationRegistrationModel.findById(
      donation.bloodDonationRegistrationId
    );
    if (!registration) {
      throw new NotFoundError("Đăng ký hiến máu không tồn tại");
    }

    registration.status = BLOOD_DONATION_REGISTRATION_STATUS.RESTING;
    await registration.save();

    // Tạo log process donation
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId,
      changedBy: staffId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
      notes: "Đang trong giao đoạn nghỉ ngơi",
    });

    const statusLog = await donorStatusLogModel.create({
      donationId,
      userId,
      staffId,
    });

    return getInfoData({
      fields: ["_id", "donationId", "userId", "staffId", "createdAt"],
      object: statusLog,
    });
  };

  // Cập nhật trạng thái người hiến
  updateDonorStatusLog = async (logId, { status, phase, notes }) => {
    // Kiểm tra log có tồn tại không
    const statusLog = await donorStatusLogModel
      .findById(logId)
      .populate("donationId", "bloodDonationRegistrationId");
    if (!statusLog) {
      throw new NotFoundError("Không tìm thấy bản ghi trạng thái");
    }
    // Kiểm tra trạng thái có hợp lệ không
    if (!Object.values(DONOR_STATUS).includes(status)) {
      throw new BadRequestError("Trạng thái không hợp lệ");
    }

    // Kiểm tra giai đoạn có hợp lệ không
    if (
      !Object.values([
        BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
        BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
      ]).includes(phase)
    ) {
      throw new BadRequestError("Giai đoạn không hợp lệ");
    }

    // Kiểm tra trạng phiếu đăng ký hiến máu
    const registration = await bloodDonationRegistrationModel
      .findById(statusLog.donationId.bloodDonationRegistrationId)
      .populate("facilityId", "name");
    if (!registration) {
      throw new NotFoundError("Đăng ký hiến máu không tồn tại");
    }
    // Cập nhật trạng thái đăng ký hiến máu
    registration.status = BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED;
    await registration.save();

    if (!notes) {
      throw new BadRequestError("Ghi chú không được để trống");
    }

    // Cập nhật trạng thái người hiến
    statusLog.status = status;
    statusLog.phase = phase;
    statusLog.notes = notes;
    statusLog.recordedAt = new Date();
    await statusLog.save();

    // Tạo log process donation để đánh dấu thời gian kiểm tra sức khoẻ
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: statusLog.userId,
      changedBy: statusLog.staffId,
      status: statusLog.phase,
      notes: "Đã kiểm tra sức khoẻ sau khi hiến máu",
    });

    // Tạo log process donation để đánh dấu xác nhận hiến máu thành công
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: statusLog.userId,
      changedBy: statusLog.staffId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED,
      notes: "Quy trình hiến máu hoàn tất",
    });

    // Gửi thông báo đến user
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      statusLog.userId,
      statusLog.status,
      registration.facilityId.name,
      statusLog.donationId._id
    );

    return getInfoData({
      fields: [
        "_id",
        "donationId",
        "userId",
        "staffId",
        "status",
        "phase",
        "notes",
        "recordedAt",
        "createdAt",
        "updatedAt",
      ],
      object: statusLog,
    });
  };

  // Lấy danh sách status logs theo donation
  getDonorStatusLogsByDonation = async (
    donationId,
    { page = 1, limit = 10 }
  ) => {
    const result = await getPaginatedData({
      model: donorStatusLogModel,
      query: { donationId },
      page,
      limit,
      select:
        "_id donationId userId staffId status phase notes recordedAt createdAt",
      populate: [
        { path: "userId", select: "fullName email phone" },
        {
          path: "staffId",
          select: "userId position",
          populate: { path: "userId", select: "fullName email" },
        },
        { path: "donationId", select: "quantity donationDate status" },
      ],
      sort: { recordedAt: -1 },
    });

    return result;
  };

  // Lấy logs theo user
  getDonorStatusLogsByUser = async (userId, { page = 1, limit = 10 }) => {
    const result = await getPaginatedData({
      model: donorStatusLogModel,
      query: { userId },
      page,
      limit,
      select:
        "_id donationId userId staffId status phase notes recordedAt createdAt",
      populate: [
        {
          path: "staffId",
          select: "userId position",
          populate: { path: "userId", select: "fullName email" },
        },
        { path: "donationId", select: "quantity donationDate status" },
      ],
      sort: { recordedAt: -1 },
    });

    return result;
  };

  // Lấy chi tiết một status log
  getDonorStatusLogDetail = async (logId) => {
    const statusLog = await donorStatusLogModel
      .findById(logId)
      .populate("userId", "fullName email phone")
      .populate({
        path: "staffId",
        select: "userId position",
        populate: { path: "userId", select: "fullName email" },
      })
      .populate("donationId", "quantity donationDate status")
      .lean();

    if (!statusLog) {
      throw new NotFoundError("Không tìm thấy bản ghi trạng thái");
    }

    return getInfoData({
      fields: [
        "_id",
        "donationId",
        "userId",
        "staffId",
        "status",
        "phase",
        "notes",
        "recordedAt",
        "createdAt",
        "updatedAt",
      ],
      object: statusLog,
    });
  };
}

module.exports = new DonorStatusLogService();
