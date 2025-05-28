"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "BloodRequestSupport";
const COLLECTION_NAME = "BloodRequestSupports";

const bloodRequestSupportSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodRequestSupportSchema);
