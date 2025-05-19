"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const bloodService = require("../services/bloodRequest.service");

class BloodRequestController {

  // Tạo yêu cầu máu
  createBloodRequest = asyncHandler(async (req, res) => {
    const result = await bloodService.createBloodRequest({
      userId: req.user._id,
      ...req.body,
    });
    new CREATED({
      message: "Blood request created successfully",
      data: result,
    }).send(res);
  });

  // Lấy danh sách yêu cầu máu
  getBloodRequests = asyncHandler(async (req, res) => {
    const { status, bloodId, isUrgent, limit, page } = req.query;
    const result = await bloodService.getBloodRequests({
      status,
      bloodId,
      isUrgent: isUrgent === "true" ? true : isUrgent === "false" ? false : undefined,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1,
    });
    new OK({
      message: "Blood requests retrieved successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new BloodRequestController();