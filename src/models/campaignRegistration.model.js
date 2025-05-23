"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "CampaignRegistration";
const COLLECTION_NAME = "CampaignRegistrations";

const campaignRegistrationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyCampaigns",
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    preferredDate: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, campaignRegistrationSchema);
