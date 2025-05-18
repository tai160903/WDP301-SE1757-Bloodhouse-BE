"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "ContentCategory";
const COLLECTION_NAME = "ContentCategories";

const contentCategorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, contentCategorySchema);
