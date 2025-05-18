"use strict";

const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const bloodRequestModel = require("../models/bloodRequest.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const axios = require("axios");

class BloodDonationService {
  // Đăng ký hiến máu
  createBloodDonationRegistration = async ({
    userId,
    facilityId,
    bloodGroupId,
    bloodComponent,
    preferredDate,
    source,
    notes,
    street,
    city,
  }) => {
    // Kiểm tra user và facility
    const [user, facility] = await Promise.all([
      bloodDonationRegistrationModel.db.collection("Users").findOne({ _id: userId }),
      bloodDonationRegistrationModel.db.collection("Facilities").findOne({ _id: facilityId }),
    ]);
    if (!user) throw new NotFoundError("User not found");
    if (!facility) throw new NotFoundError("Facility not found");

    // Lấy tọa độ từ Google Maps Geocoding API
    let location = { type: "Point", coordinates: [0, 0] };
    if (street && city) {
      const address = `${street}, ${city}`;
      const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        location.coordinates = [lng, lat];
      } else {
        throw new BadRequestError("Invalid address");
      }
    }

    const registration = await bloodDonationRegistrationModel.create({
      userId,
      facilityId,
      bloodGroupId,
      bloodComponent,
      preferredDate,
      source,
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
      ],
      object: registration,
    });
  };

  // Lấy danh sách đăng ký hiến máu
  getBloodDonationRegistrations = async ({ status, facilityId, limit = 10, page = 1 }) => {
    const query = {};
    if (status) query.status = status;
    if (facilityId) query.facilityId = facilityId;

    const skip = (page - 1) * limit;
    const registrations = await bloodDonationRegistrationModel
      .find(query)
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name street city")
      .populate("bloodGroupId", "type")
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
        ],
        object: reg,
      })
    );
  };

  // Phê duyệt đăng ký hiến máu
  approveBloodDonationRegistration = async (registrationId, staffId, status) => {
    const registration = await bloodDonationRegistrationModel.findById(registrationId);
    if (!registration) throw new NotFoundError("Registration not found");

    if (!Object.values(BLOOD_DONATION_REGISTRATION_STATUS).includes(status)) {
      throw new BadRequestError("Invalid status");
    }

    registration.status = status;
    registration.staffId = staffId;
    await registration.save();

    return getInfoData({
      fields: ["_id", "userId", "facilityId", "bloodGroupId", "status", "updatedAt"],
      object: registration,
    });
  };

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
      bloodDonationModel.db.collection("Users").findOne({ _id: userId }),
      bloodDonationRegistrationId
        ? bloodDonationModel.findById(bloodDonationRegistrationId)
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
            donation.bloodDonationRegistrationId?.facilityId?._id.toString() === facilityId.toString()
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
}

module.exports = new BloodDonationService();