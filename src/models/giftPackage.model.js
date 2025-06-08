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
  // Điều kiện áp dụng package
  minAge: {
    type: Number,
    min: 0,
    default: 0,
  },
  maxAge: {
    type: Number,
    min: 0,
    default: 100,
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

// Validation
giftPackageSchema.pre('save', function(next) {
  if (this.minAge > this.maxAge) {
    next(new Error('Minimum age cannot be greater than maximum age'));
  }
  if (this.items.length === 0) {
    next(new Error('Package must contain at least one item'));
  }
  next();
});

// Indexes
giftPackageSchema.index({ facilityId: 1, name: 1 });
giftPackageSchema.index({ facilityId: 1, isActive: 1, priority: -1 });

module.exports = mongoose.model(DOCUMENT_NAME, giftPackageSchema); 