"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Content";
const COLLECTION_NAME = "Contents";

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["introduction", "document", "blog"],
      required: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, unique: true, required: true },
    content: { type: String },
    summary: { type: String, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, contentSchema);