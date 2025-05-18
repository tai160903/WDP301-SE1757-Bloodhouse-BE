"use strict";

const bloodRequestModel = require("../models/bloodRequest.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const axios = require("axios");

class BloodRequestService {

  // Tạo yêu cầu máu
  createBloodRequest = async ({
    userId,
    bloodId,
    bloodComponent,
    quantity,
    isUrgent,
    street,
    city,
  }) => {
    // Kiểm tra user và blood group
    const [user, bloodGroup] = await Promise.all([
      bloodRequestModel.db.collection("Users").findOne({ _id: userId }),
      bloodRequestModel.db.collection("BloodGroups").findOne({ _id: bloodId }),
    ]);
    if (!user) throw new NotFoundError("User not found");
    if (!bloodGroup) throw new NotFoundError("Blood group not found");

    // Lấy tọa độ từ Google Maps Geocoding API
    let lat = 0,
      lng = 0;
    if (street && city) {
      const address = `${street}, ${city}`;
      const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        ({ lat, lng } = response.data.results[0].geometry.location);
      } else {
        throw new BadRequestError("Invalid address");
      }
    }

    const request = await bloodRequestModel.create({
      userId,
      bloodId,
      bloodComponent,
      quantity,
      isUrgent,
      street,
      city,
      lat,
      lng,
    });

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "bloodId",
        "bloodComponent",
        "quantity",
        "isUrgent",
        "status",
        "street",
        "city",
        "lat",
        "lng",
      ],
      object: request,
    });
  };

  // Lấy danh sách yêu cầu máu
  getBloodRequests = async ({ status, bloodId, isUrgent, limit = 10, page = 1 }) => {
    const query = {};
    if (status) query.status = status;
    if (bloodId) query.bloodId = bloodId;
    if (isUrgent !== undefined) query.isUrgent = isUrgent;

    const skip = (page - 1) * limit;
    const requests = await bloodRequestModel
      .find(query)
      .populate("userId", "fullName email phone")
      .populate("bloodId", "type")
      .skip(skip)
      .limit(limit)
      .lean();

    return requests.map((req) =>
      getInfoData({
        fields: [
          "_id",
          "userId",
          "bloodId",
          "bloodComponent",
          "quantity",
          "isUrgent",
          "status",
          "street",
          "city",
          "lat",
          "lng",
          "createdAt",
        ],
        object: req,
      })
    );
  };

}

module.exports = new BloodRequestService();