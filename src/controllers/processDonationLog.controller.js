"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const processDonationLogService = require("../services/processDonationLog.service");
const { DONATION_PROCESS_LOG_MESSAGE } = require("../constants/message");

class ProcessDonationLogController {
  // Tạo process donation log
  createProcessDonationLog = asyncHandler(async (req, res) => {
    const result = await processDonationLogService.createProcessDonationLog({
      changedBy: req.user.staffId,
      ...req.body,
    });
    new CREATED({
      message: DONATION_PROCESS_LOG_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách process donation logs (với filter, search, pagination)
  getProcessDonationLogs = asyncHandler(async (req, res) => {
    const { 
      status, 
      registrationId, 
      changedBy,
      search,
      page = 1, 
      limit = 10,
      startDate,
      endDate
    } = req.query;

    // Build query object
    let query = {};
    if (status) query.status = status;
    if (registrationId) query.registrationId = registrationId;
    if (changedBy) query.changedBy = changedBy;
    
    // Date range filter
    if (startDate || endDate) {
      query.changedAt = {};
      if (startDate) query.changedAt.$gte = new Date(startDate);
      if (endDate) query.changedAt.$lte = new Date(endDate);
    }

    const result = await processDonationLogService.getProcessDonationLogs({
      query,
      page: parseInt(page),
      limit: parseInt(limit),
      isPaginated: true,
      search,
      searchFields: ["notes"]
    });

    new OK({
      message: DONATION_PROCESS_LOG_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy logs theo registration ID
  getLogsByRegistrationId = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const result = await processDonationLogService.getLogsByRegistrationId(registrationId);
    
    new OK({
      message: DONATION_PROCESS_LOG_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy chi tiết một log
  getLogById = asyncHandler(async (req, res) => {
    const { logId } = req.params;
    const result = await processDonationLogService.getLogById(logId);
    
    new OK({
      message: DONATION_PROCESS_LOG_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy logs theo staff (cho nurse xem logs của mình)
  getLogsByStaff = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const staffId = req.user.staffId; 

    const result = await processDonationLogService.getLogsByStaff(staffId, {
      page: parseInt(page),
      limit: parseInt(limit),
      isPaginated: true
    });

    new OK({
      message: DONATION_PROCESS_LOG_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new ProcessDonationLogController(); 