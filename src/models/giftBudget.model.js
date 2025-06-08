"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "GiftBudget";
const COLLECTION_NAME = "GiftBudgets";

const giftBudgetSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
    index: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true, collection: COLLECTION_NAME });

// Index
giftBudgetSchema.index({ facilityId: 1, startDate: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftBudgetSchema);