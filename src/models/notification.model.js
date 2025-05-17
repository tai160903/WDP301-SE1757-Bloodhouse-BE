"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["sent", "pending"], default: "pending" },
    sendAt: { type: Date },
    createAt: { type: Date },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);