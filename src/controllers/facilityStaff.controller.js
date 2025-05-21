const { OK, CREATED } = require("../configs/success.response");
const { FACILITY_STAFF_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const facilityStaffService = require("../services/facilityStaff.service");

class FacilityStaffController {
  getAllStaffs = asyncHandler(async (req, res, next) => {
    const { limit, page } = req.query;
    const result = await facilityStaffService.getAllStaffs(
      parseInt(limit) || 10,
      parseInt(page) || 1
    );
    new OK({
      message: FACILITY_STAFF_MESSAGE.GET_ALL_FACILITY_STAFFS_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllStaffsNotAssignedToFacility = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.getAllStaffsNotAssignedToFacility(
      req.query
    );
    new OK({
      message: FACILITY_STAFF_MESSAGE.GET_ALL_FACILITY_STAFFS_SUCCESS,
      data: result,
    }).send(res);
  });

  getFacilityStaffByFacilityId = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.getFacilityStaffByFacilityId(req.params.id, req.query);
    new OK({
      message: FACILITY_STAFF_MESSAGE.GET_ALL_FACILITY_STAFFS_SUCCESS,
      data: result,
    }).send(res);
  });

  getFacilityStaffById = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.getFacilityStaffById(
      req.params.id
    );
    new OK({
      message: FACILITY_STAFF_MESSAGE.GET_FACILITY_STAFF_BY_ID_SUCCESS,
      data: result,
    }).send(res);
  });

  createFacilityStaff = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.createFacilityStaff(req.body);
    new CREATED({
      message: FACILITY_STAFF_MESSAGE.CREATE_FACILITY_STAFF_SUCCESS,
      data: result,
    }).send(res);
  });

  updateFacilityStaff = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.updateFacilityStaff(
      req.params.id,
      req.body
    );
    new OK({
      message: FACILITY_STAFF_MESSAGE.UPDATE_FACILITY_STAFF_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteFacilityStaff = asyncHandler(async (req, res, next) => {
    const result = await facilityStaffService.deleteFacilityStaff(
      req.params.id
    );
    new OK({
      message: FACILITY_STAFF_MESSAGE.DELETE_FACILITY_STAFF_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new FacilityStaffController();
