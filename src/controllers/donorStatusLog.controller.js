"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { DONOR_STATUS_LOG_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const donorStatusLogService = require("../services/donorStatusLog.service");

class DonorStatusLogController {
  // Tạo bản ghi trạng thái người hiến
  createDonorStatusLog = asyncHandler(async (req, res) => {
    const result = await donorStatusLogService.createDonorStatusLog({
      staffId: req.user.staffId,
      ...req.body,
    });
    new CREATED({
      message: DONOR_STATUS_LOG_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy danh sách status logs theo donation
  getDonorStatusLogsByDonation = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await donorStatusLogService.getDonorStatusLogsByDonation(
      req.params.donationId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      }
    );
    new OK({
      message: DONOR_STATUS_LOG_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy logs theo user
  getDonorStatusLogsByUser = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await donorStatusLogService.getDonorStatusLogsByUser(
      req.params.userId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      }
    );
    new OK({
      message: DONOR_STATUS_LOG_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Lấy chi tiết một status log
  getDonorStatusLogDetail = asyncHandler(async (req, res) => {
    const result = await donorStatusLogService.getDonorStatusLogDetail(req.params.id);
    new OK({
      message: DONOR_STATUS_LOG_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  // Cập nhật trạng thái người hiến
  updateDonorStatusLog = asyncHandler(async (req, res) => {
    const result = await donorStatusLogService.updateDonorStatusLog(req.params.id, req.body);
    new OK({
      message: DONOR_STATUS_LOG_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new DonorStatusLogController(); 