"use strict";
const mongoose = require("mongoose");
const { BLOOD_REQUEST_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "BloodRequest";
const COLLECTION_NAME = "BloodRequests";

const bloodRequestSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityStaff" },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodComponent",
      required: true,
    },
    quantity: { type: Number },
    isUrgent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(BLOOD_REQUEST_STATUS),
      default: BLOOD_REQUEST_STATUS.PENDING_APPROVAL,
    },
    patientName: { type: String, trim: true },
    patientPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
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
    scheduledDeliveryDate: { type: Date },
    isFulfilled: { type: Boolean, default: false },
    needsSupport: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

bloodRequestSchema.set("toObject", { virtuals: true });
bloodRequestSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, bloodRequestSchema);
