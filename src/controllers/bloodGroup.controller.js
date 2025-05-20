"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_GROUP_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodGroupService = require("../services/bloodGroup.service");

class BloodGroupController {
  createBloodGroup = asyncHandler(async (req, res, next) => {
    const result = await bloodGroupService.createBloodGroup(req.body);
    new CREATED({ message: BLOOD_GROUP_MESSAGE.CREATE_SUCCESS, data: result }).send(
      res
    );
  });

  getBloodGroups = asyncHandler(async (req, res, next) => {
    const result = await bloodGroupService.getBloodGroups();
    new OK({ message: BLOOD_GROUP_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getBloodGroupPositive = asyncHandler(async (req, res, next) => {
    const result = await bloodGroupService.getBloodGroupPositive();
    new OK({ message: BLOOD_GROUP_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  updateBloodGroup = asyncHandler(async (req, res, next) => {
    const result = await bloodGroupService.updateBloodGroup(req.params.id, req.body);
    new OK({ message: BLOOD_GROUP_MESSAGE.UPDATE_SUCCESS, data: result }).send(res);
  });
}

module.exports = new BloodGroupController();
