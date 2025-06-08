"use strict";

const mongoose = require("mongoose");
const { GIFT_ITEM_CATEGORY, GIFT_ITEM_UNIT } = require("../constants/enum");

const DOCUMENT_NAME = "GiftItem";
const COLLECTION_NAME = "GiftItems";

const giftItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: Object.values(GIFT_ITEM_UNIT),
    default: GIFT_ITEM_UNIT.ITEM,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(GIFT_ITEM_CATEGORY),
    default: GIFT_ITEM_CATEGORY.OTHER,
  },
  costPerUnit: {
    type: Number,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  }
}, { timestamps: true, collection: COLLECTION_NAME });

// Validation for age range
giftItemSchema.pre('save', function(next) {
  if (this.minAge > this.maxAge) {
    next(new Error('Minimum age cannot be greater than maximum age'));
  }
  next();
});

// Index
giftItemSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftItemSchema);