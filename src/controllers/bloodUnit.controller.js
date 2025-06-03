"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodUnitService = require("../services/bloodUnit.service");
const { BLOOD_UNIT_MESSAGE } = require("../constants/message");

class BloodUnitController {
  // Tạo blood units từ donation (Doctor)
  createBloodUnitsFromDonation = asyncHandler(async (req, res) => {
    const result = await bloodUnitService.createBloodUnitsFromDonation({
      staffId: req.user.staffId,
      ...req.body,
    });
    new CREATED({
      message: BLOOD_UNIT_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Cập nhật blood unit (Doctor)
  updateBloodUnit = asyncHandler(async (req, res) => {
    const result = await bloodUnitService.updateBloodUnit({
      unitId: req.params.id,
      staffId: req.user.staffId,
      ...req.body,
    });
    new OK({
      message: BLOOD_UNIT_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy blood units theo donation
  getBloodUnitsByDonation = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await bloodUnitService.getBloodUnitsByDonation(
      req.params.donationId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      }
    );
    new OK({
      message: BLOOD_UNIT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy blood units theo facility (Manager)
  getBloodUnitsByFacility = asyncHandler(async (req, res) => {
    const { status, component, bloodGroupId, page, limit, search, startDate } =
      req.query;

    const result = await bloodUnitService.getBloodUnitsByFacility(
      req.params.facilityId,
      {
        status,
        component,
        bloodGroupId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        startDate,
        endDate,
      }
    );
    new OK({
      message: BLOOD_UNIT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy chi tiết blood unit
  getBloodUnitDetail = asyncHandler(async (req, res) => {
    const result = await bloodUnitService.getBloodUnitDetail(req.params.id);
    new OK({
      message: BLOOD_UNIT_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy blood units do doctor hiện tại xử lý
  getBloodUnitsByProcessedBy = asyncHandler(async (req, res) => {
    const { 
      status, 
      component, 
      page, 
      limit, 
      search, 
      startDate, 
      endDate 
    } = req.query;
    
    const result = await bloodUnitService.getBloodUnitsByProcessedBy(
      req.user.staffId,
      {
        status,
        component,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        startDate,
        endDate
      }
    );
    new OK({
      message: BLOOD_UNIT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Thống kê blood units (Manager)
  getBloodUnitsStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await bloodUnitService.getBloodUnitsStatistics(
      req.params.facilityId,
      { startDate, endDate }
    );
    new OK({
      message: BLOOD_UNIT_MESSAGE.GET_STATISTICS_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new BloodUnitController();
