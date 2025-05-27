"use strict";
const mongoose = require("mongoose");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "ProcessDonationLog";
const COLLECTION_NAME = "ProcessDonationLogs";

const processDonationLogSchema = new mongoose.Schema(
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

// Pre-save middleware to generate unique code
processDonationLogSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'PDLG', // Process Donation LoG
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Index để tối ưu truy vấn
processDonationLogSchema.index({ registrationId: 1 });
processDonationLogSchema.index({ changedAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, processDonationLogSchema);