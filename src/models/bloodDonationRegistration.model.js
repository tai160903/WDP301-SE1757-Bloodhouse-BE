"use strict";
const mongoose = require("mongoose");
const {
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_DONATION_REGISTRATION_SOURCE,
} = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodDonationRegistration";
const COLLECTION_NAME = "BloodDonationRegistrations";

const bloodDonationRegistrationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
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
    checkInAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Pre-save middleware to generate unique code
bloodDonationRegistrationSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'BDRG', // Blood Donation ReGistration
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Tạo index 2dsphere cho trường location
bloodDonationRegistrationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(DOCUMENT_NAME, bloodDonationRegistrationSchema);
