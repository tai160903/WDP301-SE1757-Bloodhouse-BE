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
}

module.exports = new BloodInventoryController();
