"use strict";

const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const {
  BLOOD_DONATION_REGISTRATION_STATUS,
  USER_ROLE,
} = require("../constants/enum");
const userModel = require("../models/user.model");
const facilityModel = require("../models/facility.model");
const notificationService = require("./notification.service");
const bloodGroupModel = require("../models/bloodGroup.model");
const {
  USER_MESSAGE,
  FACILITY_MESSAGE,
  BLOOD_GROUP_MESSAGE,
  BLOOD_DONATION_REGISTRATION_MESSAGE
} = require("../constants/message");
const QRCode = require("qrcode");
const { getPaginatedData, populateExistingDocument, createNestedPopulateConfig } = require("../helpers/mongooseHelper");
const processDonationLogService = require("./processDonationLog.service");

class BloodDonationService {
  /** BLOOD DONATION REGISTRATION */
  // Đăng ký hiến máu
  createBloodDonationRegistration = async ({
    userId,
    facilityId,
    bloodGroupId,
    preferredDate,
    expectedQuantity,
    source,
    notes,
  }) => {
    // Kiểm tra user và facility
    const [user, facility, bloodGroup] = await Promise.all([
      userModel.findOne({ _id: userId }),
      facilityModel.findOne({ _id: facilityId }),
      bloodGroupModel.findOne({ _id: bloodGroupId }),
    ]);
    if (!user) throw new NotFoundError(USER_MESSAGE.USER_NOT_FOUND);
    if (!facility) throw new NotFoundError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
    if (!bloodGroup)
      throw new NotFoundError(BLOOD_GROUP_MESSAGE.BLOOD_GROUP_NOT_FOUND);

    // Kiểm tra xem người dùng có đăng ký nào đang chờ xử lý không
    const pendingRegistration = await bloodDonationRegistrationModel.findOne({
      userId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
    });

    if (pendingRegistration) {
      throw new BadRequestError(USER_MESSAGE.USER_HAS_PENDING_REGISTRATION);
    }

    // Lấy lần hiến máu gần nhất
    const lastDonation = await bloodDonationModel
      .findOne({ userId })
      .sort({ donationDate: -1 });

    if (lastDonation) {
      const lastDonationDate = new Date(lastDonation.donationDate);
      const currentDate = new Date();
      const monthsDiff =
        (currentDate.getFullYear() - lastDonationDate.getFullYear()) * 12 +
        (currentDate.getMonth() - lastDonationDate.getMonth());

      // Kiểm tra thời gian chờ dựa trên giới tính
      const requiredMonths = user.gender === "female" ? 4 : 3;
      if (monthsDiff < requiredMonths) {
        throw new BadRequestError(
          `Bạn cần đợi đủ ${requiredMonths} tháng kể từ lần hiến máu trước (${lastDonationDate.toLocaleDateString(
            "vi-VN"
          )})`
        );
      }
    }

    // Lấy location từ profile người dùng
    const location = user.location || { type: "Point", coordinates: [0, 0] };

    const registration = await bloodDonationRegistrationModel.create({
      userId,
      facilityId,
      bloodGroupId,
      preferredDate,
      source,
      expectedQuantity,
      notes,
      location,
    });

    // Tạo log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId,
      changedBy: null,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      notes: "Đăng ký hiến máu",
    });

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "bloodComponent",
        "preferredDate",
        "status",
        "source",
        "notes",
        "location",
        "createdAt",
        "expectedQuantity",
      ],
      object: registration,
    });
  };

  // Lấy danh sách đăng ký hiến máu
  getBloodDonationRegistrations = async ({
    status,
    facilityId,
    limit = 10,
    page = 1,
  }) => {
    const query = {};
    if (status) query.status = status;
    if (facilityId) query.facilityId = facilityId;

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select:
        "_id userId facilityId bloodGroupId bloodComponent preferredDate status source notes createdAt expectedQuantity",
      populate: [
        { path: "userId", select: "fullName email phone avatar gender" },
        { path: "facilityId", select: "name street city" },
        { path: "bloodGroupId", select: "name" },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Cập nhật đăng ký hiến máu
  updateBloodDonationRegistration = async ({
    registrationId,
    changedBy,
    status,
    staffId,
    notes,
  }) => {
    // Step 1: Find registration
    const registration = await bloodDonationRegistrationModel
      .findById(registrationId)
      .populate("facilityId", "name");
    if (!registration) throw new NotFoundError(BLOOD_DONATION_REGISTRATION_MESSAGE.BLOOD_DONATION_REGISTRATION_NOT_FOUND);

    // Step 2: Validate status
    if (!Object.values(BLOOD_DONATION_REGISTRATION_STATUS).includes(status)) {
      throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.INVALID_STATUS);
    }

    // Step 3: Handle REGISTERED or REJECTED_REGISTRATION status
    if (
      [
        BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
        BLOOD_DONATION_REGISTRATION_STATUS.REJECTED_REGISTRATION,
      ].includes(status)
    ) {
      // If REGISTERED, staffId is required
      if (status === BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED && !staffId) {
        throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.STAFF_ID_REQUIRED);
      }

      registration.status = status;

      if (status === BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED) {
        registration.staffId = staffId;

        // Step 4: Create QR code
        const qrData = {
          registrationId: registration._id,
          userId: registration.userId,
          facilityId: registration.facilityId,
          bloodGroupId: registration.bloodGroupId,
          status: registration.status,
        };
        try {
          const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
          registration.qrCodeUrl = qrCodeUrl;
        } catch (error) {
          throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.FAILED_TO_GENERATE_QR_CODE);
        }
      }
    } else {
      // Other statuses only update status and notes
      registration.status = status;

      if(status === BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN) {
        registration.checkedInAt = new Date();
      }
    }

    // Step 5: Update notes if provided
    if (notes) {
      registration.notes = notes;
    }

    // Step 6: Save changes
    await registration.save();

    // Step 7: Send notification to user
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      registration.userId,
      status,
      registration.facilityId.name,
      registration._id
    );

    // Step 8: Create process donation log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: registration.userId,
      changedBy,
      status: status,
      notes: notes,
    });

    // Step 9: Populate and return
   const result = await registration.populate([
    { path: "userId", select: "fullName email phone" },
    { path: "facilityId", select: "name street city" },
    { path: "bloodGroupId", select: "name" },
   ]);
    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "status",
        "notes",
        "qrCodeUrl",
        "updatedAt",
        "expectedQuantity",
      ],
      object: result,
    });
  };

  // Lấy danh sách đăng ký hiến máu của người dùng
  getUserBloodDonationRegistrations = async (
    userId,
    { status, limit = 10, page = 1 }
  ) => {
    const query = { userId };
    if (status) query.status = status;

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select:
        "_id userId facilityId bloodGroupId preferredDate status source notes location createdAt expectedQuantity",
      populate: [
        { path: "userId", select: "fullName email phone" },
        { path: "facilityId", select: "name street city address" },
        { path: "bloodGroupId", select: "name" },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };


  // Lấy chi tiết một đăng ký hiến máu
  getBloodDonationRegistrationDetail = async (registrationId, userId) => {
    const registration = await bloodDonationRegistrationModel
      .findOne({ _id: registrationId, userId })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name street city")
      .populate("bloodGroupId", "type")
      .lean();

    if (!registration) throw new NotFoundError("Không tìm thấy đăng ký");

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "bloodComponent",
        "preferredDate",
        "status",
        "source",
        "notes",
        "location",
        "createdAt",
        "updatedAt",
      ],
      object: registration,
    });
  };

  /** BLOOD DONATION */
  // Lấy lịch sử hiến máu của user
  getUserDonations = async (userId, limit = 10, page = 1) => {
    const result = await getPaginatedData({
      model: bloodDonationModel,
      query: { userId },
      page,
      limit,
      select:
        "_id userId bloodGroupId bloodComponent quantity donationDate status bloodDonationRegistrationId createdAt",
      populate: [
        { path: "bloodGroupId", select: "type" },
        {
          path: "bloodDonationRegistrationId",
          select: "preferredDate facilityId",
          populate: { path: "facilityId", select: "name street city" },
        },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Tạo bản ghi hiến máu
  createBloodDonation = async ({
    userId,
    staffId,
    bloodGroupId,
    bloodDonationRegistrationId,
    bloodComponent,
    quantity,
    donationDate,
  }) => {
    // Kiểm tra user và registration
    const [user, registration] = await Promise.all([
      userModel.findOne({ _id: userId }),
      bloodDonationRegistrationId
        ? bloodDonationRegistrationModel.findById(bloodDonationRegistrationId)
        : Promise.resolve(null),
    ]);
    if (!user) throw new NotFoundError("User not found");
    if (bloodDonationRegistrationId && !registration) {
      throw new NotFoundError("Registration not found");
    }

    const donation = await bloodDonationModel.create({
      userId,
      staffId,
      bloodGroupId,
      bloodDonationRegistrationId,
      bloodComponent,
      quantity,
      donationDate,
    });

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "staffId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "bloodComponent",
        "quantity",
        "donationDate",
        "status",
      ],
      object: donation,
    });
  };

  // Lấy danh sách hiến máu
  getBloodDonations = async ({ status, facilityId, limit = 10, page = 1 }) => {
    const query = {};
    if (status) query.status = status;

    const result = await getPaginatedData({
      model: bloodDonationModel,
      query,
      page,
      limit,
      select:
        "_id userId bloodGroupId bloodComponent quantity donationDate status bloodDonationRegistrationId createdAt",
      populate: [
        { path: "userId", select: "fullName email phone" },
        { path: "bloodGroupId", select: "type" },
        {
          path: "bloodDonationRegistrationId",
          select: "facilityId preferredDate",
          populate: { path: "facilityId", select: "name street city" },
        },
      ],
      sort: { createdAt: -1 },
    });

    // Lọc theo facilityId nếu có
    if (facilityId) {
      result.data = result.data.filter(
        (donation) =>
          donation.bloodDonationRegistrationId?.facilityId?._id.toString() ===
          facilityId.toString()
      );
    }

    return result;
  };

  // Lấy chi tiết một bản ghi hiến máu
  getBloodDonationDetail = async (donationId, userId, role) => {
    const query =
      role === USER_ROLE.NURSE ||
      role === USER_ROLE.MANAGER ||
      role === USER_ROLE.DOCTOR
        ? { _id: donationId }
        : { _id: donationId, userId };
    const donation = await bloodDonationModel
      .findOne(query)
      .populate("userId", "fullName email phone")
      .populate("bloodGroupId", "type")
      .populate({
        path: "bloodDonationRegistrationId",
        select: "preferredDate facilityId",
        populate: { path: "facilityId", select: "name street city location" },
      })
      .lean();

    if (!donation) throw new NotFoundError("Không tìm thấy bản ghi hiến máu");

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "staffId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "bloodComponent",
        "quantity",
        "donationDate",
        "status",
        "createdAt",
        "updatedAt",
      ],
      object: donation,
    });
  };
}

module.exports = new BloodDonationService();
