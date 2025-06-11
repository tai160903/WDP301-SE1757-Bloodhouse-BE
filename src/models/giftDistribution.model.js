"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "GiftDistribution";
const COLLECTION_NAME = "GiftDistributions";

const giftDistributionSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
    index: true,
  },
  giftItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftItem",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodDonation",
    required: true,
    index: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftPackage",
    required: false,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  distributedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacilityStaff",
    required: true,
  },
  distributedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  notes: {
    type: String,
  }
}, { timestamps: true, collection: COLLECTION_NAME });

// Indexes
giftDistributionSchema.index({ facilityId: 1, distributedAt: 1 });
giftDistributionSchema.index({ userId: 1, distributedAt: 1 });
giftDistributionSchema.index({ packageId: 1, distributedAt: 1 });
giftDistributionSchema.index({ giftItemId: 1, distributedAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftDistributionSchema);