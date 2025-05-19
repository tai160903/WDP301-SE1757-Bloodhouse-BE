"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_DONATION_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "BloodDonation";
const COLLECTION_NAME = "BloodDonations";

const bloodDonationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    bloodDonationRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodDonationRegistration" },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
    quantity: { type: Number },
    donationDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BLOOD_DONATION_STATUS),
      default: BLOOD_DONATION_STATUS.CONFIRMED,
    },
    notes: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodDonationSchema);