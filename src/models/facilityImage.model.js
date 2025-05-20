"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "FacilityImage";
const COLLECTION_NAME = "FacilityImages";

const facilityImageSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, facilityImageSchema);
