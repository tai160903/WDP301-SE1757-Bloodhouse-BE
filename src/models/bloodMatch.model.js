"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "BloodMatch";
const COLLECTION_NAME = "BloodMatches";

const bloodMatchSchema = new mongoose.Schema(
  {
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    componentId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodComponent", required: true },
    isMatch: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodMatchSchema);