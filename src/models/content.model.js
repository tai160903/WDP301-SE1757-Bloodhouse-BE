"use strict";
const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
const { CONTENT_STATUS } = require("../constants/enum");
mongoose.plugin(slug);

const DOCUMENT_NAME = "Content";
const COLLECTION_NAME = "Contents";

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["introduction", "document", "blog"],
      required: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ContentCategory" },
    facilityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Facility",
      default: null // null = system-wide content (Admin), has value = facility-specific content (Manager)
    },
    title: { type: String, trim: true, required: true },
    image: { type: String, trim: true },
    slug: { 
      type: String, 
      slug: "title",  // Generate slug from title field
      unique: true,   // Ensure unique slugs
      slugPaddingSize: 4,  // Add 4 random digits to ensure uniqueness
      permanent: true  // Don't change slug if title changes
    },
    content: { type: String },
    summary: { type: String, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: [CONTENT_STATUS.DRAFT, CONTENT_STATUS.PUBLISHED, CONTENT_STATUS.ARCHIVED],
      default: CONTENT_STATUS.DRAFT,
    }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, contentSchema);