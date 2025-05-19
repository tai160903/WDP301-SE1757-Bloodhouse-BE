"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "GiftItem";
const COLLECTION_NAME = "GiftItems";

const giftItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, giftItemSchema);
