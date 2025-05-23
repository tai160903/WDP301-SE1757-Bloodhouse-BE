"use strict";

const { ENTITY_TYPE } = require("../constants/enum");
const notificationModel = require("../models/notification.model");
const userModel = require("../models/user.model");
const { Expo } = require("expo-server-sdk");

class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  sendPushNotification = async (userId, { title, body, data = {}, entityType, relatedEntityId }) => {
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
}

module.exports = new NotificationService();
