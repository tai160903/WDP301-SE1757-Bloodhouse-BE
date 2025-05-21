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
const bloodGroupModel = require("../models/bloodGroup.model");
const { USER_MESSAGE, FACILITY_MESSAGE, BLOOD_GROUP_MESSAGE } = require("../constants/message");

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
    if (!bloodGroup) throw new NotFoundError(BLOOD_GROUP_MESSAGE.BLOOD_GROUP_NOT_FOUND);

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
      const monthsDiff = (currentDate.getFullYear() - lastDonationDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - lastDonationDate.getMonth());

      // Kiểm tra thời gian chờ dựa trên giới tính
      const requiredMonths = user.gender === 'female' ? 4 : 3;
      if (monthsDiff < requiredMonths) {
        throw new BadRequestError(
          `Bạn cần đợi đủ ${requiredMonths} tháng kể từ lần hiến máu trước (${lastDonationDate.toLocaleDateString('vi-VN')})`
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

    const skip = (page - 1) * limit;
    const registrations = await bloodDonationRegistrationModel
      .find(query)
      .populate("userId", "fullName email phone avatar")
      .populate("facilityId", "name street city address")
      .populate("bloodGroupId", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    return registrations.map((reg) =>
      getInfoData({
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
          "createdAt",
          "expectedQuantity",
        ],
        object: reg,
      })
    );
  };

  // Phê duyệt đăng ký hiến máu
  approveBloodDonationRegistration = async (
    registrationId,
    staffId,
    status
  ) => {
    const registration = await bloodDonationRegistrationModel.findById(
      registrationId
    );
    if (!registration) throw new NotFoundError("Registration not found");

    if (!Object.values(BLOOD_DONATION_REGISTRATION_STATUS).includes(status)) {
      throw new BadRequestError("Invalid status");
    }

    registration.status = status;
    registration.staffId = staffId;
    await registration.save();

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "status",
        "updatedAt",
        "expectedQuantity",
      ],
      object: registration,
    });
  };

  // Lấy danh sách đăng ký hiến máu của người dùng
  getUserBloodDonationRegistrations = async (
    userId,
    { status, limit = 10, page = 1 }
  ) => {
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const registrations = await bloodDonationRegistrationModel
      .find(query)
      .populate("userId", "fullName email phone avatar")
      .populate("facilityId", "name street city address")
      .populate("bloodGroupId", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    return registrations.map((reg) =>
      getInfoData({
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
        object: reg,
      })
    );
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
    const skip = (page - 1) * limit;
    const donations = await bloodDonationModel
      .find({ userId })
      .populate("bloodGroupId", "type")
      .populate("bloodDonationRegistrationId", "preferredDate facilityId")
      .skip(skip)
      .limit(limit)
      .lean();

    return donations.map((donation) =>
      getInfoData({
        fields: [
          "_id",
          "userId",
          "bloodGroupId",
          "bloodComponent",
          "quantity",
          "donationDate",
          "status",
          "bloodDonationRegistrationId",
          "createdAt",
        ],
        object: donation,
      })
    );
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

    const skip = (page - 1) * limit;
    const donations = await bloodDonationModel
      .find(query)
      .populate("userId", "fullName email phone")
      .populate("bloodGroupId", "type")
      .populate({
        path: "bloodDonationRegistrationId",
        select: "facilityId preferredDate",
        populate: { path: "facilityId", select: "name street city" },
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Lọc theo facilityId nếu có
    if (facilityId) {
      return donations
        .filter(
          (donation) =>
            donation.bloodDonationRegistrationId?.facilityId?._id.toString() ===
            facilityId.toString()
        )
        .map((donation) =>
          getInfoData({
            fields: [
              "_id",
              "userId",
              "bloodGroupId",
              "bloodComponent",
              "quantity",
              "donationDate",
              "status",
              "bloodDonationRegistrationId",
              "createdAt",
            ],
            object: donation,
          })
        );
    }

    return donations.map((donation) =>
      getInfoData({
        fields: [
          "_id",
          "userId",
          "bloodGroupId",
          "bloodComponent",
          "quantity",
          "donationDate",
          "status",
          "bloodDonationRegistrationId",
          "createdAt",
        ],
        object: donation,
      })
    );
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
