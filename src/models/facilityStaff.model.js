"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "FacilityStaff";
const COLLECTION_NAME = "FacilityStaffs";

const facilityStaffSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    position: { type: String, trim: true },
    assigned_at: { type: Date },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, facilityStaffSchema);