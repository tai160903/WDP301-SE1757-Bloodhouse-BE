"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "FacilitySchedule";
const COLLECTION_NAME = "FacilitySchedules";

const facilityScheduleSchema = new mongoose.Schema(
  {
    facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    date: { type: Date },
    time_slot: { type: String, trim: true },
    status: { type: String, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, facilityScheduleSchema);