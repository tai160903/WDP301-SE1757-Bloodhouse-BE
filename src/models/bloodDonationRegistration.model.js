"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_DONATION_REGISTRATION_STATUS, BLOOD_DONATION_REGISTRATION_SOURCE } = require("../constants/enum");

const DOCUMENT_NAME = "BloodDonationRegistration";
const COLLECTION_NAME = "BloodDonationRegistrations";


const bloodDonationRegistrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
    },
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BLOOD_DONATION_REGISTRATION_STATUS),
      default: BLOOD_DONATION_REGISTRATION_STATUS.PENDING,
    },
    notes: { type: String },
    source: { type: String, enum: Object.values(BLOOD_DONATION_REGISTRATION_SOURCE) },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module. exports = mongoose.model(DOCUMENT_NAME, bloodDonationRegistrationSchema);