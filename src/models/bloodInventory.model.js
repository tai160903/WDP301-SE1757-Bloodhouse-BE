"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT, BLOOD_GROUP } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodInventory";
const COLLECTION_NAME = "BloodInventories";

const bloodInventorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
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

// Pre-save middleware to generate unique code
bloodInventorySchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME), 
        'BINV', // Blood INVentory
        'code'
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model(DOCUMENT_NAME, bloodInventorySchema);
