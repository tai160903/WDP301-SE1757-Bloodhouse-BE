"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const healthCheckService = require("../services/healthCheck.service");
const { HEALTH_CHECK_MESSAGE } = require("../constants/message");

class HealthCheckController {
  createHealthCheck = asyncHandler(async (req, res, next) => {
    const staffId = req.user.staffId;
    const result = await healthCheckService.createHealthCheck(
      req.body,
      staffId
    );
    new CREATED({
      message: HEALTH_CHECK_MESSAGE.CREATE_SUCCESS,
      data: result.data,
    }).send(res);
  });

  updateHealthCheck = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const doctorId = req.user.userId;
    const result = await healthCheckService.updateHealthCheck(
      id,
      req.body,
      doctorId
    );
    new OK({
      message: HEALTH_CHECK_MESSAGE.UPDATE_SUCCESS,
      data: result.data,
    }).send(res);
  });
}

module.exports = new HealthCheckController();
