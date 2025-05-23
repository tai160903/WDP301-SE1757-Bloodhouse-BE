"use strict";
const mongoose = require("mongoose");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "ProcessDonationLog";
const COLLECTION_NAME = "ProcessDonationLogs";

const processDonationLogSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodDonationRegistration",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BLOOD_DONATION_REGISTRATION_STATUS),
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
    },
    notes: {
      type: String,
      default: null,
    },
    changedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Index để tối ưu truy vấn
processDonationLogSchema.index({ registrationId: 1 });
processDonationLogSchema.index({ changedAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, processDonationLogSchema);