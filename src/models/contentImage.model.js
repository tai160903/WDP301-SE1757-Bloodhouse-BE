"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "ContentImage";
const COLLECTION_NAME = "ContentImages";

const contentImageSchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
    url: { type: String, trim: true, required: true },
    caption: { type: String, trim: true },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, contentImageSchema);