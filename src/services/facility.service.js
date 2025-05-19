const { BadRequestError } = require("../configs/error.response");
const { FACILITY_MESSAGE } = require("../constants/message");
const facilityModel = require("../models/facility.model");

class FacilityService {
  getAllFacilities = async () => {
    try {
      const result = await facilityModel.find();
      return {
        total: result.length,
        result,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.GET_ALL_FACILITIES_FAILED);
    }
  };

  getFacilityById = async (id) => {
    try {
      const result = await facilityModel.findById(id);
      if (!result) {
        throw new BadRequestError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
      }
      return {
        result,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.GET_FACILITY_BY_ID_FAILED);
    }
  };

  createFacility = async (data) => {
    try {
      const result = await facilityModel.create(data);
      return {
        result,
      };
    } catch (error) {
      throw new BadRequestError(FACILITY_MESSAGE.CREATE_FACILITY_FAILED);
    }
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
