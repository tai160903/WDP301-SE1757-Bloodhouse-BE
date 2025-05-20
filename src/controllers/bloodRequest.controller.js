"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_REQUEST_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodRequestService = require("../services/bloodRequest.service");

class BloodRequestController {

  // Tạo yêu cầu máu
  createBloodRequest = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    const files = req.files;
    const result = await bloodRequestService.createBloodRequest(
      { ...req.body, files },
      userId
    );
    new CREATED({
      message: BLOOD_REQUEST_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách yêu cầu máu của người dùng
  getUserBloodRequests = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await bloodRequestService.getUserBloodRequests(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder,
    });
    new OK({
      message: BLOOD_REQUEST_MESSAGE.GET_USER_SUCCESS,
      data: result.data,
      metadata: result.metadata,
    }).send(res);
  });

  // Lấy chi tiết yêu cầu máu của người dùng
  getUserBloodRequestDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const result = await bloodRequestService.getUserBloodRequestDetails(id, userId);
    new OK({
      message: BLOOD_REQUEST_MESSAGE.GET_DETAILS_SUCCESS,
      data: result.data,
    }).send(res);
  });

  // Lấy danh sách yêu cầu máu của cơ sở
  getFacilityBloodRequests = asyncHandler(async (req, res, next) => {
    const { facilityId } = req.params;
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await bloodRequestService.getFacilityBloodRequests(facilityId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder,
    });
    new OK({
      message: BLOOD_REQUEST_MESSAGE.GET_FACILITY_SUCCESS,
      data: result.data,
      metadata: result.metadata,
    }).send(res);
  });

  // Lấy danh sách yêu cầu máu của cơ sở theo người dùng
  getFacilityBloodRequestsByUser = asyncHandler(async (req, res, next) => {
    const { facilityId, userId } = req.params;
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await bloodRequestService.getFacilityBloodRequestsByUser(
      facilityId,
      userId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        search,
        sortBy,
        sortOrder,
      }
    );
    new OK({
      message: BLOOD_REQUEST_MESSAGE.GET_FACILITY_USER_SUCCESS,
      data: result.data,
      metadata: result.metadata,
    }).send(res);
  });

  // Lấy chi tiết yêu cầu máu của cơ sở
  getFacilityBloodRequestDetails = asyncHandler(async (req, res, next) => {
    const { id, facilityId } = req.params;
    const result = await bloodRequestService.getFacilityBloodRequestDetails(id, facilityId);
    new OK({
      message: BLOOD_REQUEST_MESSAGE.GET_DETAILS_SUCCESS,
      data: result.data,
    }).send(res);
  });

  // Cập nhật trạng thái yêu cầu máu
  updateBloodRequestStatus = asyncHandler(async (req, res, next) => {
    const { id, facilityId } = req.params;
    const { status, staffId } = req.body;
    const result = await bloodRequestService.updateBloodRequestStatus(id, facilityId, {
      status,
      staffId,
    });
    new OK({
      message: BLOOD_REQUEST_MESSAGE.UPDATE_STATUS_SUCCESS,
      data: result.data,
    }).send(res);
  });
}

module.exports = new BloodRequestController();