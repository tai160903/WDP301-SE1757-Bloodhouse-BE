"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { NOTIFICATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const notificationService = require("../services/notification.service");

class NotificationController {
  getNotificationUser = asyncHandler(async (req, res, next) => {
    const result = await notificationService.getNotificationUser({
      userId: req.user.userId,
      ...req.query,
    });
    new OK({ message: NOTIFICATION_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });
}

module.exports = new NotificationController();
