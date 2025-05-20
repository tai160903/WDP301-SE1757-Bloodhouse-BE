"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_REQUEST_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "BloodRequest";
const COLLECTION_NAME = "BloodRequests";

const bloodRequestSchema = new mongoose.Schema(
  {
    bloodId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
    quantity: { type: Number },
    isUrgent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(BLOOD_REQUEST_STATUS),
      default: BLOOD_REQUEST_STATUS.PENDING,
    },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    medicalDocumentUrl: {
      type: [String],
      validate: {
        validator: (docs) => docs.length >= 1 && docs.length <= 5,
        message: "Medical document must have 1 to 5 items",
      },
      required: true,
    },
    note: { type: String, trim: true },
    preferredDate: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodRequestSchema);