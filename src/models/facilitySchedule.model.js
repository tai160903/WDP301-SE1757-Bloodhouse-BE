"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "FacilitySchedule";
const COLLECTION_NAME = "FacilitySchedules";

const facilityScheduleSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    dayOfWeek: { type: Number, required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    // isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: COLLECTION_NAME,
  }
);

facilityScheduleSchema.virtual("isOpen").get(function () {
  const now = new Date();

  // Giờ hiện tại ở Asia/Ho_Chi_Minh
  const localNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  
  const currentDay = localNow.getDay(); // 0 (CN) -> 6 (T7)
  const currentTimeMinutes = localNow.getHours() * 60 + localNow.getMinutes();

  // Nếu không phải hôm nay => đóng
  if (this.dayOfWeek !== currentDay) return false;

  // Parse giờ mở cửa & đóng cửa
  const [openHour, openMinute] = this.openTime.split(":").map(Number);
  const [closeHour, closeMinute] = this.closeTime.split(":").map(Number);

  const openTimeMinutes = openHour * 60 + openMinute;
  const closeTimeMinutes = closeHour * 60 + closeMinute;

  // Trường hợp mở qua đêm (ví dụ 22:00 - 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return (
      currentTimeMinutes >= openTimeMinutes || currentTimeMinutes <= closeTimeMinutes
    );
  }

  // Trường hợp mở cùng ngày
  return (
    currentTimeMinutes >= openTimeMinutes &&
    currentTimeMinutes <= closeTimeMinutes
  );
});

facilityScheduleSchema.set("toJSON", { virtuals: true });
facilityScheduleSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, facilityScheduleSchema);
