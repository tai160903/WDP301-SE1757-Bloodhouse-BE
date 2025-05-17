"use strict";
const mongoose = require("mongoose");
const { REPORT_TYPE } = require("../constants/enum");
const DOCUMENT_NAME = "Report";
const COLLECTION_NAME = "Reports";


const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(REPORT_TYPE),
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, reportSchema);