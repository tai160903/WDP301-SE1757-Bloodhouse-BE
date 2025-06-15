"use strict";

const { ENTITY_TYPE, NOTIFICATION_TYPE } = require("../constants/enum");
const notificationModel = require("../models/notification.model");
const userModel = require("../models/user.model");
const { Expo } = require("expo-server-sdk");
const dayjs = require("dayjs");
const { getPaginatedData } = require("../helpers/mongooseHelper");

class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  sendPushNotification = async (
    userId,
    { title, body, data = {}, entityType, relatedEntityId }
  ) => {
    try {
      // Find user and get their Expo push token
      const user = await userModel.findById(userId);
      if (!user || !user.expoPushToken) {
        return null;
      }

      // Create the notification message
      const message = {
        to: user.expoPushToken,
        sound: "default",
        title,
        body,
        data,
      };

      // Validate the token
      if (!Expo.isExpoPushToken(message.to)) {
        console.error(`Invalid Expo push token: ${message.to}`);
        return null;
      }

      // Send the notification
      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (let chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending notification chunk:", error);
        }
      }

      // Save notification to database
      await notificationModel.create({
        userId,
        type: data.type || "general",
        title,
        message: body,
        data,
        status: "sent",
        entityType,
        relatedEntityId,
        createAt: new Date(),
      });

      return tickets;
    } catch (error) {
      console.error("Error sending push notification:", error);
      return null;
    }
  };

  sendBloodDonationRegistrationStatusNotification = async (
    userId,
    status,
    facilityName,
    entityId
  ) => {
    let title = "Cập nhật đăng ký hiến máu";
    let body = "";
    let type = "request";
    let relatedEntityId = "";
    let entityType = "bloodDonationRegistration";

    switch (status) {
      case "registered":
        entityType = "bloodDonationRegistration";
        relatedEntityId = entityId;
        body = `Đăng ký hiến máu của bạn tại ${facilityName} đã được duyệt. Vui lòng đến đúng giờ hẹn.`;
        break;
      case "rejected_registration":
        entityType = "bloodDonationRegistration";
        relatedEntityId = entityId;
        body = `Rất tiếc, đăng ký hiến máu của bạn tại ${facilityName} đã bị từ chối.`;
        break;
      case "checked_in":
        entityType = "bloodDonationRegistration";
        relatedEntityId = entityId;
        body = `Bạn đã đến hiến máu tại ${facilityName}. Vui lòng đợi được cập nhật thông tin.`;
        break;
      case "donated":
        entityType = "bloodDonation";
        relatedEntityId = entityId;
        body = `Bạn đã hiến máu tại ${facilityName}. Cảm ơn bạn đã đóng góp cho sức khỏe cộng đồng.`;
        break;
      default:
        body = `Trạng thái đăng ký hiến máu của bạn tại ${facilityName} đã được cập nhật thành ${status}.`;
    }

    return this.sendPushNotification(userId, {
      title,
      body,
      data: { type, status },
      entityType,
      relatedEntityId,
    });
  };

  sendBloodRequestStatusNotification = async (
    userId,
    status,
    facilityName,
    entityId,
    reasonRejected
  ) => {
    let title = "Cập nhật đơn yêu cầu máu";
    let body = "";
    let type = "request";
    let relatedEntityId = entityId;
    let entityType = "bloodRequest";

    switch (status) {
      case "pending_approval":
        body = `Đơn yêu cầu máu của bạn tại ${facilityName} đang chờ xác nhận.`;
        break;
      case "approved":
        body = `Đơn yêu cầu máu của bạn tại ${facilityName} đã được duyệt.`;
        break;
      case "rejected_registration":
        body = `Đơn yêu cầu máu của bạn tại ${facilityName} đã bị từ chối. Lý do: ${reasonRejected}`;
        break;
      case "assigned":
        body = `Đơn yêu cầu máu của bạn tại ${facilityName} đã được phân phối và đang chờ người giao nhận đơn.`;
        break;
      case "completed":
        body = `Đơn yêu cầu máu của bạn tại ${facilityName} đã hoàn thành.`;
        break;
      default:
        body = `Trạng thái đơn yêu cầu máu của bạn tại ${facilityName} đã được cập nhật thành ${status}.`;
    }

    return this.sendPushNotification(userId, {
      title,
      body,
      data: { type, status },
      entityType,
      relatedEntityId,
    });
  };

  sendBloodRequestStatusNotificationToTransporter = async (
    transporterId,
    status,
    facilityName,
    deliveryId
  ) => {
    let title = "Cập nhật đơn giao nhận máu";
    let body = "";
    let type = "delivery";
    let relatedEntityId = deliveryId;
    let entityType = "bloodDelivery";

    switch (status) {
      case "pending":
        body = `Có đơn yêu cầu máu tại ${facilityName} đang chờ bạn giao nhận.`;
        break;
      case "completed":
        body = `Đơn giao nhận máu của bạn tại ${facilityName} đã được giao nhận thành công.`;
        break;
      default:
        body = `Trạng thái đơn giao nhận máu của bạn tại ${facilityName} đã được cập nhật thành ${status}.`;
    }

    return this.sendPushNotification(transporterId, {
      title,
      body,
      data: { type, status },
      entityType,
      relatedEntityId,
    });
  };

  sendReminderDonationNotification = async (
    userId,
    preferredDate,
    entityId
  ) => {
    const title = "Nhắc lịch hiến máu";
    const body = `Bạn có lịch hiến máu lúc ${dayjs(preferredDate).format(
      "HH:mm DD/MM/YYYY"
    )}. Vui lòng đến đúng giờ!`;

    return this.sendPushNotification(userId, {
      title,
      body,
      data: { type: NOTIFICATION_TYPE.REMINDER, preferredDate },
      entityType: ENTITY_TYPE.BLOOD_DONATION_REGISTRATION,
      relatedEntityId: entityId,
    });
  };
 
  sendBloodSupportRequestNotification = async (
    targetUserId,
    patientName,
    bloodGroup,
    component,
    requestId
  ) => {
    const title = "Yêu cầu hỗ trợ hiến máu";
    const body = `${patientName} cần máu ${bloodGroup} ${component} gần bạn – Nhấn để xem chi tiết và giúp đỡ 👉`;

    return this.sendPushNotification(targetUserId, {
      title,
      body,
      data: {
        type: NOTIFICATION_TYPE.SUPPORT_REQUEST,
        bloodGroup,
        requestId,
      },
      entityType: ENTITY_TYPE.BLOOD_REQUEST,
      relatedEntityId: requestId,
    });
  };

  getNotificationUser = async ({ userId, page = 1, limit = 10 }) => {
    const query = { userId };
    const result = await getPaginatedData({
      model: notificationModel,
      query,
      page,
      limit,
      select:
        "_id title message data status entityType relatedEntityId createAt type",
      search: "",
      searchFields: ["title", "message"],
      sort: { createAt: -1 },
    });
    return result;
  };
}

module.exports = new NotificationService();
