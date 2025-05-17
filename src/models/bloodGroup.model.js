"use strict";
const mongoose = require("mongoose");
const { BLOOD_GROUP } = require("../constants/enum");

const DOCUMENT_NAME = "BloodGroup";
const COLLECTION_NAME = "BloodGroups";

const bloodGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(BLOOD_GROUP),
      required: true,
    },
    note: { type: String, trim: true },
    characteristics: [{ type: String, trim: true }],
    populationRate: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodGroupSchema);