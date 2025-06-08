"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Facility";
const COLLECTION_NAME = "Facilities";

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    code: { type: String, trim: true, unique: true, required: true },
    address: { type: String, trim: true },
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
    avgRating: { type: Number, default: 0 },
    totalFeedback: { type: Number, default: 0 },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

facilitySchema.virtual("schedules", {
  ref: "FacilitySchedule",
  localField: "_id",
  foreignField: "facilityId",
});

// Virtual for main image
facilitySchema.virtual("mainImage", {
  ref: "FacilityImage",
  localField: "_id",
  foreignField: "facilityId",
  justOne: true,
  match: { isMain: true },
});

facilitySchema.set("toJSON", { virtuals: true });
facilitySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, facilitySchema);
