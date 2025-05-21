const { BadRequestError } = require("../configs/error.response");
const { USER_ROLE } = require("../constants/enum");
const { FACILITY_STAFF_MESSAGE } = require("../constants/message");
const facilityStaffModel = require("../models/facilityStaff.model");
const userModel = require("../models/user.model");

class FacilityStaffService {
  getAllStaffs = async () => {
    const result = await facilityStaffModel
      .find({ isDeleted: { $ne: true } })
      .populate("userId", "fullName email phone avatar")
      .populate("facilityId", "name address");
    return result;
  };

  getAllStaffsNotAssignedToFacility = async ({ position }) => {
    const result = await facilityStaffModel.find({
      isDeleted: { $ne: true },
      facilityId: { $exists: false },
      position: { $in: position },
    });
    return result;
  };

  getFacilityStaffByFacilityId = async (facilityId, { position }) => {
    if (!facilityId) {
      throw new BadRequestError(FACILITY_STAFF_MESSAGE.FACILITY_ID_REQUIRED);
    }
    const query = {
      facilityId,
      isDeleted: { $ne: true },
    };
    if (position) {
      query.position = { $in: position };
    }
    const result = await facilityStaffModel
      .find(query)
      .populate("userId", "fullName email phone avatar")
      .populate("facilityId", "name address");
    console.log(result);
    return {
      total: result.length,
      result,
    };
  };

  getFacilityStaffById = async (id) => {
    if (!id) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_ID_REQUIRED
      );
    }
    const result = await facilityStaffModel
      .findById(id)
      .populate("userId", "fullName email phone avatar")
      .populate("facilityId", "name address");
    if (!result) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_NOT_FOUND
      );
    }
    return result;
  };

  createFacilityStaff = async (data) => {
    const { userId, position } = data;

    if (!userId || !position) {
      throw new BadRequestError(FACILITY_STAFF_MESSAGE.FACILITY_STAFF_REQUIRED);
    }

    const user = await facilityStaffModel.findOne({
      userId,
      isDeleted: { $ne: true },
    });
    if (user) {
      throw new BadRequestError(FACILITY_STAFF_MESSAGE.STAFF_ALREADY_EXISTS);
    }

    const newFacilityStaff = new facilityStaffModel(data);
    await newFacilityStaff.save();
    return newFacilityStaff;
  };

  updateFacilityStaff = async (id, data) => {
    if (!id) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_ID_REQUIRED
      );
    }
    const updatedFacilityStaff = await facilityStaffModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    if (!updatedFacilityStaff) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_NOT_FOUND
      );
    }
    return updatedFacilityStaff;
  };

  deleteFacilityStaff = async (id) => {
    if (!id) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_ID_REQUIRED
      );
    }
    const deletedFacilityStaff = await facilityStaffModel.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    await userModel.findByIdAndUpdate(
      deletedFacilityStaff.userId,
      { role: USER_ROLE.MEMBER },
      { new: true }
    );

    if (!deletedFacilityStaff) {
      throw new BadRequestError(
        FACILITY_STAFF_MESSAGE.FACILITY_STAFF_NOT_FOUND
      );
    }
    return deletedFacilityStaff;
  };
}

module.exports = new FacilityStaffService();
