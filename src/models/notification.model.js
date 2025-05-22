"use strict";
const mongoose = require("mongoose");
const { NOTIFICATION_TYPE, ENTITY_TYPE } = require("../constants/enum");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), trim: true },
    title: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, trim: true },
    data: { type: Object },
    status: { type: String, enum: ["sent", "pending"], default: "pending" },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
    entityType: { type: String, enum: Object.values(ENTITY_TYPE) },
    createAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);