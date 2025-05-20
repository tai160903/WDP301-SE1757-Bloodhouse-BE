"use strict";
const mongoose = require("mongoose");
const { STAFF_POSITION } = require("../constants/enum");

const DOCUMENT_NAME = "FacilityStaff";
const COLLECTION_NAME = "FacilityStaffs";

const facilityStaffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility"
    },
    position: {
      type: String,
      enum: Object.values(STAFF_POSITION),
      required: true,
    },
    assignedAt: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, facilityStaffSchema);
