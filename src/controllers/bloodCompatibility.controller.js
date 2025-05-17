"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_COMPATIBILITY_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodCompatibilityService = require("../services/bloodCompatibility.service");

class BloodCompatibilityController {
  createBloodCompatibility = asyncHandler(async (req, res, next) => {
    const result = await bloodCompatibilityService.createBloodCompatibility(req.body);
    new CREATED({ message: BLOOD_COMPATIBILITY_MESSAGE.CREATE_SUCCESS, data: result }).send(
      res
    );
  });

  getBloodCompatibilities = asyncHandler(async (req, res, next) => {
    const result = await bloodCompatibilityService.getBloodCompatibilities(req.query);
    new OK({ message: BLOOD_COMPATIBILITY_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });
}

module.exports = new BloodCompatibilityController();
