const mongoose = require("mongoose");

const DOCUMENT_NAME = "Feedback";
const COLLECTION_NAME = "Feedbacks";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, feedbackSchema);
