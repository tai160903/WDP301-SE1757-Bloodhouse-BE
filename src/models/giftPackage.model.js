"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "GiftPackage";
const COLLECTION_NAME = "GiftPackages";

const giftPackageItemSchema = new mongoose.Schema({
  giftItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GiftItem",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  }
}, { _id: false });

const giftPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
    index: true,
  },
  items: [giftPackageItemSchema], // Danh sách các quà tặng trong package
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    index: true,
  }, // Số lượng gói hiện có
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  }, // Số lượng đang được reserve (cho future use)
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacilityStaff",
    required: true,
  },
  // Thông tin display
  image: {
    type: String,
  },
  priority: {
    type: Number,
    default: 0, // Càng cao càng ưu tiên
  }
}, { timestamps: true, collection: COLLECTION_NAME });

// Virtual for available quantity
giftPackageSchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Ensure virtual fields are serialized
giftPackageSchema.set('toJSON', { virtuals: true });
giftPackageSchema.set('toObject', { virtuals: true });

// Validation
giftPackageSchema.pre('save', function(next) {
  if (this.items.length === 0) {
    next(new Error('Package must contain at least one item'));
  }
  if (this.reservedQuantity > this.quantity) {
    next(new Error('Reserved quantity cannot exceed total quantity'));
  }
  next();
});

// Indexes
giftPackageSchema.index({ facilityId: 1, name: 1 });
giftPackageSchema.index({ facilityId: 1, isActive: 1, priority: -1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftPackageSchema); 