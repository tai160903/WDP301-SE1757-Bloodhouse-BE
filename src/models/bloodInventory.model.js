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
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodComponent",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup",
      required: true,
    },
    totalQuantity: { type: Number, required: true },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodInventorySchema);
