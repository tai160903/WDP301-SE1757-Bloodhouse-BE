"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT } = require("../constants/enum");

const DOCUMENT_NAME = "BloodRequest";
const COLLECTION_NAME = "BloodRequests";

const bloodRequestSchema = new mongoose.Schema(
  {
    bloodId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
    quantity: { type: Number },
    isUrgent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodRequestSchema);