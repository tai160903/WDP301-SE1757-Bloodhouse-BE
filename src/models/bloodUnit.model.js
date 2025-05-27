"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodUnit";
const COLLECTION_NAME = "BloodUnits";

const bloodUnitSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    donationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BloodDonation",
      required: true 
    },
    facilityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Facility",
      required: true 
    },
    bloodRequestId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BloodRequest" 
    },
    bloodGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup",
      required: true
    },
    component: { 
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true 
    },
    quantity: { 
      type: Number,
      required: true 
    },
    collectedAt: { 
      type: Date,
      required: true 
    },
    expiresAt: { 
      type: Date,
      required: true 
    },
    status: {
      type: String,
      enum: ["available", "reserved", "used", "expired", "testing", "rejected"],
      default: "testing",
    },
    testResults: {
      hiv: { type: String, enum: ["positive", "negative", "pending"], default: "pending" },
      hepatitisB: { type: String, enum: ["positive", "negative", "pending"], default: "pending" },
      hepatitisC: { type: String, enum: ["positive", "negative", "pending"], default: "pending" },
      syphilis: { type: String, enum: ["positive", "negative", "pending"], default: "pending" },
      notes: { type: String }
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff"
    },
    processedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff"
    },
    approvedAt: { type: Date }
  },
  { 
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, 
    collection: COLLECTION_NAME 
  }
);

// Pre-save middleware to generate unique code
bloodUnitSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'BUNT', // Blood UNiT
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes
bloodUnitSchema.index({ donationId: 1 });
bloodUnitSchema.index({ facilityId: 1 });
bloodUnitSchema.index({ status: 1 });
bloodUnitSchema.index({ expiresAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, bloodUnitSchema);