"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "BloodUnit";
const COLLECTION_NAME = "BloodUnits";

const bloodUnitSchema = new mongoose.Schema(
  {
    donation_id: { type: mongoose.Schema.Types.ObjectId, ref: "BloodDonation" },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
    group: { type: String, trim: true },
    rh: { type: String, trim: true },
    component: { type: String, trim: true },
    quantity: { type: Number },
    collected_at: { type: Date },
    expires_at: { type: Date },
    status: {
      type: String,
      enum: ["available", "reserved", "used", "expired"],
      default: "available",
    },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodUnitSchema);