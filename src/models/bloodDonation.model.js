"use strict";
const mongoose = require("mongoose");
const { BLOOD_DONATION_STATUS } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodDonation";
const COLLECTION_NAME = "BloodDonations";

const bloodDonationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    bloodDonationRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodDonationRegistration" },
    quantity: { type: Number },
    donationDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(BLOOD_DONATION_STATUS),
      default: BLOOD_DONATION_STATUS.DONATING,
    },
    notes: { type: String },
    isDivided: { type: Boolean, default: false },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    healthCheckId: { type: mongoose.Schema.Types.ObjectId, ref: "HealthCheck" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

// Pre-save middleware to generate unique code
bloodDonationSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'BDON', // Blood DONation
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model(DOCUMENT_NAME, bloodDonationSchema);