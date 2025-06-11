"use strict";

const mongoose = require("mongoose");
const { GIFT_ACTION } = require("../constants/enum");

const DOCUMENT_NAME = "GiftLog";
const COLLECTION_NAME = "GiftLogs";

const giftLogSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
    index: true,
  },
  giftItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftItem",
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftPackage",
  },
  action: {
    type: String,
    required: true,
    enum: Object.values(GIFT_ACTION),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodDonation",
    default: null,
  },
  details: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true, collection: COLLECTION_NAME });

// Index
giftLogSchema.index({ facilityId: 1, timestamp: 1 });
giftLogSchema.index({ packageId: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftLogSchema);