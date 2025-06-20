"use strict";

const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");
const BloodDelivery = require("../models/bloodDelivery.model");

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Lưu trữ mapping user_id -> socket.id
  const userSockets = new Map();
  // Lưu trữ mapping delivery_id -> tracking_info để theo dõi downtime
  const deliveryTracking = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET_SIGNATURE
      );
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Lưu socket.id vào userSockets
    userSockets.set(socket.user.userId, socket.id);

    // Gửi sự kiện xác thực thành công
    socket.emit("authenticated", {
      message: "Connected to notification service",
    });

    // Xử lý cập nhật vị trí từ transporter
    socket.on("transporter:location", async (data) => {
      try {
        const { latitude, longitude, deliveryId, timestamp } = data;

        // Cập nhật vị trí trong database

        await BloodDelivery.findByIdAndUpdate(deliveryId, {
          currentLocation: {
            type: "Point",
            coordinates: [longitude, latitude],
            updatedAt: new Date(timestamp),
          },
        });

        console.log("latitude ", latitude, "longitude ", longitude);

        // Cập nhật thông tin tracking
        deliveryTracking.set(deliveryId, {
          lastUpdate: timestamp,
          transporterId: socket.user.userId,
          isActive: true,
        });

        // Broadcast vị trí mới đến các client đang theo dõi delivery này
        socket.broadcast.emit(`delivery:${deliveryId}:location`, {
          latitude,
          longitude,
          updatedAt: timestamp,
        });
      } catch (error) {
        console.error("Error updating delivery location:", error);
        socket.emit("error", {
          message: "Failed to update location",
          error: error.message,
        });
      }
    });

    // Xử lý resume tracking từ transporter
    socket.on("transporter:resume_tracking", async (data) => {
      try {
        const { deliveryId, lastLocation, startTime, resumeTime } = data;

        // Kiểm tra quyền của transporter với delivery này
        const delivery = await BloodDelivery.findById(deliveryId).populate(
          "transporterId"
        );
        if (
          !delivery ||
          delivery.transporterId.userId.toString() !== socket.user.userId
        ) {
          console.log("Không có quyền resume tracking cho delivery");
          throw new Error(
            `Không có quyền resume tracking cho delivery ${deliveryId}`
          );
        }

        // Tính toán thời gian downtime
        const lastUpdateTime = lastLocation
          ? new Date(lastLocation.timestamp)
          : new Date(startTime);
        const resumeDateTime = new Date(resumeTime);
        const downtimeMinutes = Math.floor(
          (resumeDateTime - lastUpdateTime) / (1000 * 60)
        );


        // Cập nhật vị trí cuối cùng vào database
        if (lastLocation) {
          await BloodDelivery.findByIdAndUpdate(deliveryId, {
            currentLocation: {
              type: "Point",
              coordinates: [lastLocation.longitude, lastLocation.latitude],
              updatedAt: new Date(lastLocation.timestamp),
            },
          });
        }

        // Lưu thông tin tracking mới
        deliveryTracking.set(deliveryId, {
          lastUpdate: resumeTime,
          transporterId: socket.user.userId,
          isActive: true,
          resumeCount: (deliveryTracking.get(deliveryId)?.resumeCount || 0) + 1,
          totalDowntime:
            (deliveryTracking.get(deliveryId)?.totalDowntime || 0) +
            downtimeMinutes,
        });

        // Gửi xác nhận về cho transporter
        socket.emit("tracking:resumed", {
          deliveryId,
          downtime: downtimeMinutes,
          message: "Tracking resumed successfully",
        });
      } catch (error) {
        console.error("Error resuming tracking:", error);
        socket.emit("error", {
          message: "Failed to resume tracking",
          error: error.message,
        });
      }
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.userId}`);
      userSockets.delete(socket.user.userId);

      // Đánh dấu các delivery của user này là không active
      for (const [deliveryId, tracking] of deliveryTracking.entries()) {
        if (tracking.transporterId === socket.user.userId) {
          deliveryTracking.set(deliveryId, {
            ...tracking,
            isActive: false,
            lastDisconnect: new Date().toISOString(),
          });
        }
      }
    });
  });

  // Hàm gửi thông báo đến user_id
  const emitNotification = (user_id, notification) => {
    const socketId = userSockets.get(user_id.toString());
    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }
  };

  return { io, emitNotification };
};

module.exports = initSocket;
