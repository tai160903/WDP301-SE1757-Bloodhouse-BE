"use strict";

const { CREATED, OK } = require("../configs/success.response");
const { BLOOD_REQUEST_SUPPORT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodRequestSupportService = require("../services/bloodRequestSupport.service");

class BloodRequestSupportController {
  // Tạo đăng ký chiến dịch
  createBloodRequestSupport = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    const result = await bloodRequestSupportService.createBloodRequestSupport(
      req.body,
      userId
    );
    new CREATED({
      message: BLOOD_REQUEST_SUPPORT_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });
  // Lấy danh sách đăng ký chiến dịch
  getBloodRequestSupports = asyncHandler(async (req, res, next) => {
    const result = await bloodRequestSupportService.getBloodRequestSupports();
    new OK({
      message: BLOOD_REQUEST_SUPPORT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });
  // Lấy danh sách đăng ký chiến dịch theo requestId
  getBloodRequestSupportsByRequestId = asyncHandler(async (req, res, next) => {
    const result =
      await bloodRequestSupportService.getBloodRequestSupportsByRequestId(
        req.params.requestId
      );
    new OK({
      message: BLOOD_REQUEST_SUPPORT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // Cập nhật trạng thái đăng ký hỗ trợ
  updateBloodRequestSupportStatus = asyncHandler(async (req, res, next) => {
    const result =
      await bloodRequestSupportService.updateBloodRequestSupportStatus(
        req.params.requestId,
        req.body.status
      );
    new OK({
      message: BLOOD_REQUEST_SUPPORT_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new BloodRequestSupportController();
