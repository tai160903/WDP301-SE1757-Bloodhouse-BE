"use strict";
const mongoose = require("mongoose");
const {
  BLOOD_COMPONENT,
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_DONATION_REGISTRATION_SOURCE,
} = require("../constants/enum");

const DOCUMENT_NAME = "BloodDonationRegistration";
const COLLECTION_NAME = "BloodDonationRegistrations";

const bloodDonationRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },

    preferredDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BLOOD_DONATION_REGISTRATION_STATUS),
      default: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
    },
    notes: { type: String },
    expectedQuantity: { type: Number },
    source: { type: String, enum: Object.values(BLOOD_DONATION_REGISTRATION_SOURCE) },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Tạo index 2dsphere cho trường location
bloodDonationRegistrationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(DOCUMENT_NAME, bloodDonationRegistrationSchema);
