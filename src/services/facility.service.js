const { BadRequestError } = require("../configs/error.response");
const {
  STAFF_POSITION,
  BLOOD_GROUP,
  BLOOD_COMPONENT,
} = require("../constants/enum");
const { FACILITY_MESSAGE } = require("../constants/message");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const facilityModel = require("../models/facility.model");
const facilityImageModel = require("../models/facilityImage.model");
const crypto = require("crypto");
const facilityStaffModel = require("../models/facilityStaff.model");
const facilityScheduleModel = require("../models/facilitySchedule.model");

class FacilityService {
  getAllFacilities = async ({ latitude, longitude }) => {
    try {
      // Get current day of week (0-6, where 0 is Sunday)
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
      return {
        total: facilities.length,
        result: facilities,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.GET_ALL_FACILITIES_FAILED);
    }
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
    doctorIds = JSON.parse(doctorIds) || [];
    nurseIds = JSON.parse(nurseIds) || [];
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
      throw new BadRequestError("Cơ sở phải có ít nhất 1 quản lý");
    }
    staffEntries.push({
      facilityId,
      userId: managerId,
      position: STAFF_POSITION.MANAGER,
    });

    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      const doctorEntries = doctorIds.map((doctorId) => ({
        facilityId,
        userId: doctorId,
        position: STAFF_POSITION.DOCTOR,
      }));
      staffEntries.push(...doctorEntries);
    }

    if (Array.isArray(nurseIds) && nurseIds.length > 0) {
      const nurseEntries = nurseIds.map((nurseId) => ({
        facilityId,
        userId: nurseId,
        position: STAFF_POSITION.NURSE,
      }));
      staffEntries.push(...nurseEntries);
    }

    await facilityStaffModel.insertMany(staffEntries);

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
