"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "BloodCompatibility";
const COLLECTION_NAME = "BloodCompatibilities";

const bloodCompatibilitySchema = new mongoose.Schema(
  {
    bloodGroupId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BloodGroup", 
      required: true 
    },
    componentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BloodComponent", 
      required: true 
    },
    canDonateTo: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup"
    }],
    canReceiveFrom: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodGroup"
    }]
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME 
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodCompatibilitySchema);