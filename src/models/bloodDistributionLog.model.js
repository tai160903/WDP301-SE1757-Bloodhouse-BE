"use strict";
const mongoose = require("mongoose");
const { BLOOD_DELIVERY_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "BloodDistributionLog";
const COLLECTION_NAME = "BloodDistributionLogs";

const bloodDistributionLogSchema = new mongoose.Schema(
  {
    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    bloodUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodUnit",
      required: true,
    },
    quantityDistributed: {
      type: Number,
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodDistributionLogSchema);
