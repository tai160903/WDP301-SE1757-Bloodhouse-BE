"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "GiftInventory";
const COLLECTION_NAME = "GiftInventories";

const giftInventorySchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
    index: true,
  },
  giftItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftItem",
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be an integer"
    }
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Reserved quantity must be an integer"
    }
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  lastStockDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, collection: COLLECTION_NAME });

// Virtual for available quantity
giftInventorySchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Indexes
giftInventorySchema.index({ facilityId: 1, giftItemId: 1 }, { unique: true });
giftInventorySchema.index({ facilityId: 1, quantity: 1 });
giftInventorySchema.index({ facilityId: 1, isActive: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftInventorySchema);