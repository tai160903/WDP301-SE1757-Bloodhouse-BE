"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "EmergencyCampaigns";
const COLLECTION_NAME = "EmergencyCampaigns";

const emergencyCampaignsSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    quantityNeeded: { type: Number, required: true },
    deadline: { type: Date },
    note: { type: String },
    status: {
      type: String,
      enum: ["open", "closed", "completed", "expired"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, emergencyCampaignsSchema);
