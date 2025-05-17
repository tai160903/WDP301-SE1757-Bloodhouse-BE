"use strict";
const mongoose = require("mongoose");
const { BLOOD_COMPONENT } = require("../constants/enum");

const DOCUMENT_NAME = "BloodComponent";
const COLLECTION_NAME = "BloodComponents";

const bloodComponentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(BLOOD_COMPONENT),
      required: true,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, bloodComponentSchema);