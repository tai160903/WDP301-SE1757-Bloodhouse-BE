const { BadRequestError } = require("../configs/error.response");
const {
  STAFF_POSITION,
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_REQUEST_STATUS,
} = require("../constants/enum");
const {
  FACILITY_MESSAGE,
  FACILITY_STAFF_MESSAGE,
} = require("../constants/message");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const facilityModel = require("../models/facility.model");
const facilityImageModel = require("../models/facilityImage.model");
const crypto = require("crypto");
const facilityStaffModel = require("../models/facilityStaff.model");
const facilityScheduleModel = require("../models/facilitySchedule.model");
const bloodInventoryModel = require("../models/bloodInventory.model");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const bloodRequestModel = require("../models/bloodRequest.model");
const { calculateDistance } = require("../utils/distanceCaculate");
const { default: mongoose } = require("mongoose");

class FacilityService {
  getAllFacilities = async ({ latitude, longitude, distance }) => {
    const today = new Date().getDay();
    const facilities = await facilityModel
      .find({ isActive: true })
      .populate({
        path: "schedules", // giả sử facility có mảng schedules ref đến FacilitySchedule
        match: { dayOfWeek: today }, // chỉ lấy lịch hôm nay
      })
      .populate({
        path: "mainImage",
        match: { isMain: true },
      })
      .exec();

    let filteredFacilities = facilities;
    if (latitude && longitude && distance) {
      filteredFacilities = facilities.filter((facility) => {
        const facilityDistance = calculateDistance(
          latitude,
          longitude,
          facility.location.coordinates[1],
          facility.location.coordinates[0]
        );

        return facilityDistance < distance;
      });
    }
    return {
      total: filteredFacilities.length,
      result: filteredFacilities,
    };
  };

  getFacilityById = async (id) => {
    const today = new Date().getDay();
    const result = await facilityModel
      .findById(id)
      .populate({
        path: "schedules",
        match: { dayOfWeek: today },
      })
      .populate({
        path: "mainImage",
        match: { isMain: true },
      })
      .exec();
    if (!result) {
      throw new BadRequestError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
    }
    return result;
  };

  getFacilityStats = async (facilityId) => {
    const facility = await facilityModel.findById(facilityId);
    if (!facility) {
      throw new BadRequestError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
    }

    const bloodInventoryStats = await bloodInventoryModel.aggregate([
      { $match: { facilityId: facility._id } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$totalQuantity" },
        },
      },
    ]);

    const totalBloodQuantity =
      bloodInventoryStats.length > 0 ? bloodInventoryStats[0].totalQuantity : 0;

    const totalDonationRequestPending = await bloodDonationRegistrationModel
      .find({
        facilityId,
        status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      })
      .countDocuments();

    const totalReceiveRequestPending = await bloodRequestModel
      .find({
        facilityId,
        status: BLOOD_REQUEST_STATUS.PENDING_APPROVAL,
      })
      .countDocuments();

    const totalEmergencyRequest = await bloodRequestModel
      .find({
        facilityId,
        isUrgent: true,
      })
      .countDocuments();
      
    return {
      totalBloodInventory: totalBloodQuantity,
      totalDonationRequestPending,
      totalReceiveRequestPending,
      totalEmergencyRequest,
    };
  };

  createFacility = async (
    {
      name,
      address,
      longitude,
      latitude,
      contactPhone,
      contactEmail,
      managerId,
      doctorIds = [],
      nurseIds = [],
    },
    file
  ) => {
    doctorIds = doctorIds ? JSON.parse(doctorIds) : [];
    nurseIds = nurseIds ? JSON.parse(nurseIds) : [];
    // 1. Upload ảnh nếu có
    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "facility" });
      image = result.url;
    }

    // 2. Tạo facility
    const result = await facilityModel.create({
      name,
      code: crypto.randomBytes(6).toString("hex"),
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      contactPhone,
      contactEmail,
    });

    const facilityId = result._id;

    // 3. Lưu ảnh chính nếu có
    if (image) {
      await facilityImageModel.create({
        facilityId,
        url: image,
        isMain: true,
      });
    }

    // 4. Gán Manager và Staff
    const staffEntries = [];

    if (!managerId) {
      throw new BadRequestError(FACILITY_MESSAGE.MANAGER_REQUIRED);
    }

    // Validate manager
    const manager = await facilityStaffModel.findOne({
      userId: managerId,
      facilityId: { $exists: false }, // Make sure not assigned to any facility
      isDeleted: { $ne: true },
      position: STAFF_POSITION.MANAGER,
    });
    if (!manager) {
      throw new BadRequestError(FACILITY_STAFF_MESSAGE.MANAGER_NOT_FOUND);
    }
    staffEntries.push({
      facilityId,
      userId: managerId,
      position: STAFF_POSITION.MANAGER,
      assignedAt: new Date(),
    });

    // Validate doctors
    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      const existingDoctors = await facilityStaffModel.find({
        userId: { $in: doctorIds },
        facilityId: { $exists: false },
        isDeleted: { $ne: true },
        position: STAFF_POSITION.DOCTOR,
      });

      if (existingDoctors.length !== doctorIds.length) {
        throw new BadRequestError(FACILITY_STAFF_MESSAGE.DOCTOR_NOT_FOUND);
      }

      const doctorEntries = doctorIds.map((doctorId) => ({
        facilityId,
        userId: doctorId,
        position: STAFF_POSITION.DOCTOR,
        assignedAt: new Date(),
      }));
      staffEntries.push(...doctorEntries);
    }

    // Validate nurses
    if (Array.isArray(nurseIds) && nurseIds.length > 0) {
      const existingNurses = await facilityStaffModel.find({
        userId: { $in: nurseIds },
        facilityId: { $exists: false },
        isDeleted: { $ne: true },
        position: STAFF_POSITION.NURSE,
      });

      if (existingNurses.length !== nurseIds.length) {
        throw new BadRequestError(FACILITY_STAFF_MESSAGE.NURSE_NOT_FOUND);
      }

      const nurseEntries = nurseIds.map((nurseId) => ({
        facilityId,
        userId: nurseId,
        position: STAFF_POSITION.NURSE,
        assignedAt: new Date(),
      }));
      staffEntries.push(...nurseEntries);
    }

    // Update all staff entries at once
    await facilityStaffModel.updateMany(
      { userId: { $in: staffEntries.map((entry) => entry.userId) } },
      { $set: { facilityId: facilityId, assignedAt: new Date() } }
    );

    // 5. Tạo lịch hoạt động mặc định (cả tuần, 8h - 17h)
    const defaultSchedules = Array.from({ length: 7 }, (_, day) => ({
      facilityId,
      dayOfWeek: day,
      openTime: "08:00",
      closeTime: "17:00",
      isOpen: true,
    }));
    await facilityScheduleModel.insertMany(defaultSchedules);

    return result;
  };

  updateFacility = async (id, data) => {
    try {
      const result = await facilityModel.update(id, data);
      return {
        result,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.UPDATE_FACILITY_FAILED);
    }
  };

  deleteFacility = async (id) => {
    try {
      const result = await facilityModel.update(
        id,
        ($set = { isDelete: true })
      );
      return {
        result,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.DELETE_FACILITY_FAILED);
    }
  };
}

module.exports = new FacilityService();
