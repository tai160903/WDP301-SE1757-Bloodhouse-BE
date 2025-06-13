"use strict";

const mongoose = require("mongoose");
const { EVENT_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "Event";
const COLLECTION_NAME = "Events";

const eventSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    bannerUrl: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
    },
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    expectedParticipants: {
      type: Number,
      required: true,
    },
    registeredParticipants: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Index để tối ưu truy vấn
eventSchema.index({ userId: 1 });
eventSchema.index({ staffId: 1 });
eventSchema.index({ createdAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, eventSchema);