"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_COMPONENT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodComponentService = require("../services/bloodComponent.service");

class BloodComponentController {
  createBloodComponent = asyncHandler(async (req, res, next) => {
    const result = await bloodComponentService.createBloodComponent(req.body);
    new CREATED({ message: BLOOD_COMPONENT_MESSAGE.CREATE_SUCCESS, data: result }).send(
      res
    );
  });

  getBloodComponents = asyncHandler(async (req, res, next) => {
    const result = await bloodComponentService.getBloodComponents();
    new OK({ message: BLOOD_COMPONENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  updateBloodComponent = asyncHandler(async (req, res, next) => {
    const result = await bloodComponentService.updateBloodComponent(req.params.id, req.body);
    new OK({ message: BLOOD_COMPONENT_MESSAGE.UPDATE_SUCCESS, data: result }).send(res);
  });
}

module.exports = new BloodComponentController();
