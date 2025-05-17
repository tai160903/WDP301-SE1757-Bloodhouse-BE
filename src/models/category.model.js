"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, categorySchema);