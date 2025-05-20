const { BadRequestError } = require("../configs/error.response");
const { USER_ROLE } = require("../constants/enum");
const { FACILITY_STAFF_MESSAGE } = require("../constants/message");
const facilityStaffModel = require("../models/facilityStaff.model");
const userModel = require("../models/user.model");

class FacilityStaffService {
  getAllFacilityStaff = async (facilityId) => {
    try {
      if (!facilityId) {
        throw new BadRequestError(FACILITY_STAFF_MESSAGE.FACILITY_ID_REQUIRED);
      }
      const result = await facilityStaffModel
        .find({ facilityId, isDeleted: { $ne: true } })
        .populate("userId", "name email phoneNumber avatar")
        .populate("facilityId", "name address");
      return {
        total: result.length,
        result,
      };
    } catch (error) {
      throw error;
    }
  };

  getFacilityStaffById = async (id) => {
    try {
      if (!id) {
        throw new BadRequestError(
          FACILITY_STAFF_MESSAGE.FACILITY_STAFF_ID_REQUIRED
        );
      }
      const result = await facilityStaffModel
        .findById(id)
        .populate("userId", "name email phoneNumber avatar")
        .populate("facilityId", "name address");
      if (!result) {
        throw new BadRequestError(
          FACILITY_STAFF_MESSAGE.FACILITY_STAFF_NOT_FOUND
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  createFacilityStaff = async (data) => {
    try {
      const { userId, facilityId, position } = data;
      if (!userId || !facilityId || !position) {
        throw new BadRequestError(
          FACILITY_STAFF_MESSAGE.FACILITY_STAFF_REQUIRED
        );
      }
      const updateRoleUser = await userModel.findByIdAndUpdate(
        userId,
        { role: position },
        { new: true }
      );

      const newFacilityStaff = new facilityStaffModel(data);
      await newFacilityStaff.save();
      return newFacilityStaff;
    } catch (error) {
      throw error;
    }
  };

  updateFacilityStaff = async (id, data) => {
    try {
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
    } catch (error) {
      throw error;
    }
  };

  deleteFacilityStaff = async (id) => {
    try {
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
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new FacilityStaffService();
