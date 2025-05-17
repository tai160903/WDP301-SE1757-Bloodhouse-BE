"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Facility";
const COLLECTION_NAME = "Facilities";

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    code: { type: String, trim: true, unique: true, required: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    contact_phone: { type: String, trim: true },
    contact_email: { type: String, trim: true },
  },
  { timestamps: { createdAt: "-created_at", updatedAt: "updated_at" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, facilitySchema);