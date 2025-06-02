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
    const staffId = req.user.staffId;
    const result = await healthCheckService.updateHealthCheck(
      id,
      req.body,
      staffId
    );
    new OK({
      message: HEALTH_CHECK_MESSAGE.UPDATE_SUCCESS,
      data: result.data,
    }).send(res);
  });

  // Lấy danh sách kiểm tra sức khỏe của cơ sở
  getFacilityHealthChecks = asyncHandler(async (req, res) => {
    const facilityId = req.user.facilityId;
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await healthCheckService.getFacilityHealthChecks(facilityId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder: parseInt(sortOrder) || -1,
    });
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách kiểm tra sức khỏe của bác sĩ
  getDoctorHealthChecks = asyncHandler(async (req, res) => {
    const staffId = req.user.staffId;
    const { page, limit, status, search, sortBy, sortOrder, isEligible } = req.query;
    const result = await healthCheckService.getDoctorHealthChecks(staffId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      isEligible,
      search,
      sortBy,
      sortOrder: parseInt(sortOrder) || -1,
      status,
    });
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách kiểm tra sức khỏe của người dùng
  getUserHealthChecks = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await healthCheckService.getUserHealthChecks(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder: parseInt(sortOrder) || -1,
    });
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách kiểm tra sức khỏe của nurse
  getNurseHealthChecks = asyncHandler(async (req, res) => {
    const staffId = req.user.staffId;
    const { page, limit, status, search, sortBy, sortOrder, isCompleted } = req.query;
    const result = await healthCheckService.getNurseHealthChecks(staffId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder: parseInt(sortOrder) || -1,
      isCompleted,
    });
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy chi tiết kiểm tra sức khỏe
  getHealthCheckDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, role, staffId } = req.user;
    const result = await healthCheckService.getHealthCheckDetail(id, userId, role, staffId);
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_DETAIL_SUCCESS,
      data: result.data,
    }).send(res);
  });

  // Lấy chi tiết kiểm tra sức khỏe theo registration ID
  getHealthCheckByRegistrationId = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { userId, role, staffId } = req.user;
    const result = await healthCheckService.getHealthCheckByRegistrationId(registrationId, userId, role, staffId);
    new OK({
      message: HEALTH_CHECK_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new HealthCheckController();
