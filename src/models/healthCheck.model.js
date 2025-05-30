"use strict";
const mongoose = require("mongoose");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");
const { HEALTH_CHECK_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "HealthCheck";
const COLLECTION_NAME = "HealthChecks";

const healthCheckSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodDonationRegistration",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      default: null,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    checkDate: {
      type: Date,
      required: true,
    },
    isEligible: {
      type: Boolean,
      default: null,
    },
    bloodPressure: {
      type: String, // e.g., "120/80 mmHg" (huyết áp)
      default: null,
    },
    hemoglobin: {
      type: Number, // g/dL (đơn vị đo nồng độ hemoglobin trong máu)
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (v >= 10 && v <= 20); // Phạm vi hợp lý
        },
        message: "Nồng độ hemoglobin phải từ 10 đến 20 g/dL",
      },
    },
    weight: {
      type: Number, // kg
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (v >= 40 && v <= 150); // Phạm vi hợp lý
        },
        message: "Cân nặng phải từ 40 đến 150 kg",
      },
    },
    pulse: {
      type: Number, // bpm
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (v >= 50 && v <= 120); // Phạm vi hợp lý
        },
        message: "Nhịp tim phải từ 50 đến 120 bpm",
      },
    },
    temperature: {
      type: Number, // °C
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (v >= 35 && v <= 38); // Phạm vi hợp lý
        },
        message: "Temperature must be between 35 and 38 °C",
      },
    },
    generalCondition: {
      type: String, // e.g., "Good", "Fatigued"
      default: null,
    },
    deferralReason: {
      type: String, // Lý do không đủ điều kiện, e.g., "Low hemoglobin"
      default: null,
    },
    notes: {
      type: String, // Ghi chú thêm
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(HEALTH_CHECK_STATUS),
      default: HEALTH_CHECK_STATUS.PENDING,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Pre-save middleware to generate unique code
healthCheckSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'HLCK', // HeaLth ChecK
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Index để tối ưu truy vấn
healthCheckSchema.index({ registrationId: 1 });
healthCheckSchema.index({ userId: 1 });
healthCheckSchema.index({ checkDate: 1 });

// Validation cho checkDate (không ở tương lai)
healthCheckSchema.path("checkDate").validate(function (value) {
  return value <= new Date();
}, "Check date cannot be in the future");

module.exports = mongoose.model(DOCUMENT_NAME, healthCheckSchema);
