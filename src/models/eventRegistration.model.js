"use strict";

const mongoose = require("mongoose");
const { EVENT_REGISTRATION_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "EventRegistration";
const COLLECTION_NAME = "EventRegistrations";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_REGISTRATION_STATUS),
      default: EVENT_REGISTRATION_STATUS.REGISTERED,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Index để tối ưu truy vấn
eventRegistrationSchema.index({ userId: 1 });
eventRegistrationSchema.index({ eventId: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, eventRegistrationSchema);