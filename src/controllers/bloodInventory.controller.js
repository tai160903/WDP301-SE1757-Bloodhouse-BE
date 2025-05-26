"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_INVENTORY_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodInventoryService = require("../services/bloodInventory.service");

class BloodInventoryController {
  createBloodInventory = asyncHandler(async (req, res, next) => {
    const result = await bloodInventoryService.createBloodInventory(req.body);
    new CREATED({ message: BLOOD_INVENTORY_MESSAGE.CREATE_SUCCESS, data: result }).send(res);
  });

  getBloodInventory = asyncHandler(async (req, res, next) => {
    const result = await bloodInventoryService.getBloodInventory();
    new OK({ message: BLOOD_INVENTORY_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getBloodInventoryByFacilityId = asyncHandler(async (req, res, next) => {
    const result = await bloodInventoryService.getBloodInventoryByFacilityId(req.params.facilityId);
    new OK({ message: BLOOD_INVENTORY_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getBloodInventoryByFacilityIdAvailable = asyncHandler(async (req, res, next) => {
    const result = await bloodInventoryService.getBloodInventoryByFacilityIdAvailable(req.params.facilityId, req.query);
    new OK({ message: BLOOD_INVENTORY_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  // Lấy inventory theo facility (Manager)
  getInventoryByFacility = asyncHandler(async (req, res) => {
    const { componentId, groupId, page, limit } = req.query;
    const result = await bloodInventoryService.getInventoryByFacility(
      req.params.facilityId,
      {
        componentId,
        groupId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      }
    );
    new OK({
      message: "Lấy inventory theo facility thành công",
      data: result,
    }).send(res);
  });

  // Lấy chi tiết inventory
  getInventoryDetail = asyncHandler(async (req, res) => {
    const result = await bloodInventoryService.getInventoryDetail(req.params.id);
    new OK({
      message: "Lấy chi tiết inventory thành công",
      data: result,
    }).send(res);
  });

  // Thống kê inventory (Manager)
  getInventoryStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await bloodInventoryService.getInventoryStatistics(
      req.params.facilityId,
      { startDate, endDate }
    );
    new OK({
      message: "Lấy thống kê inventory thành công",
      data: result,
    }).send(res);
  });

  // Lấy units sắp hết hạn (Manager)
  getExpiringUnits = asyncHandler(async (req, res) => {
    const { days, page, limit } = req.query;
    const result = await bloodInventoryService.getExpiringUnits(
      req.params.facilityId,
      {
        days: parseInt(days) || 7,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      }
    );
    new OK({
      message: "Lấy danh sách units sắp hết hạn thành công",
      data: result,
    }).send(res);
  });

  // Cập nhật units hết hạn (Manager)
  updateExpiredUnits = asyncHandler(async (req, res) => {
    const result = await bloodInventoryService.updateExpiredUnits(req.params.facilityId);
    new OK({
      message: result.message,
      data: result,
    }).send(res);
  });

  // Reserve units cho blood request (Manager)
  reserveUnits = asyncHandler(async (req, res) => {
    const result = await bloodInventoryService.reserveUnits(
      req.params.facilityId,
      req.body
    );
    new OK({
      message: "Reserve units thành công",
      data: result,
    }).send(res);
  });
}

module.exports = new BloodInventoryController();
