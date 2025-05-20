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

}

module.exports = new BloodRequestController();