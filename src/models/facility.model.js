"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Facility";
const COLLECTION_NAME = "Facilities";

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    code: { type: String, trim: true, unique: true, required: true },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
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
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

// Tạo index 2dsphere cho trường location
facilitySchema.index({ location: "2dsphere" });

module.exports = mongoose.model(DOCUMENT_NAME, facilitySchema);