"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_GROUP } = require("../constants/enum");

const DOCUMENT_NAME = "BloodInventory";
const COLLECTION_NAME = "BloodInventories";

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    bloodComponent: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
    bloodGroup: { type: String, enum: Object.values(BLOOD_GROUP), required: true },
    quantity: { type: Number, enum: [250, 300], required: true },
    import: { type: Date },
    lastUpdate: { type: Date },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodInventorySchema);