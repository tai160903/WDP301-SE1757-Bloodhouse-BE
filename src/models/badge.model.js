"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Badge";
const COLLECTION_NAME = "Badges";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: {
        name: String,
        library: String,
        color: String,
      }
    },
    criteria: {
      type: {
        type: String,
        enum: [
          "donation_count",
          "campaign_participation",
          "first_donation",
          "registration",
        ],
        required: true,
      },
      value: {
        type: Number,
        default: 1,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, badgeSchema);
