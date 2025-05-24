"use strict";

const mongoose = require("mongoose");
const { BLOOD_DONATION_REGISTRATION_STATUS, DONOR_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "DonorStatusLog";
const COLLECTION_NAME = "DonorStatusLogs";

const donorStatusLogSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodDonation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DONOR_STATUS),    
      required: false,
    },
    phase: {
      type: String,
      enum: [BLOOD_DONATION_REGISTRATION_STATUS.RESTING, BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK],
      default: BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
    },
    notes: {
      type: String,
      default: null,
    },
    recordedAt: {
      type: Date
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Index để tối ưu truy vấn
donorStatusLogSchema.index({ donationId: 1 });
donorStatusLogSchema.index({ userId: 1 });
donorStatusLogSchema.index({ recordedAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, donorStatusLogSchema);