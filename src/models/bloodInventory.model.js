"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_GROUP } = require("../constants/enum");

const DOCUMENT_NAME = "BloodInventory";
const COLLECTION_NAME = "BloodInventories";

const bloodInventorySchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BLOOD_GROUP),
      required: true,
    },
    totalQuantity: { type: Number, required: true },
    lastUpdate: { type: Date },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodInventorySchema);
