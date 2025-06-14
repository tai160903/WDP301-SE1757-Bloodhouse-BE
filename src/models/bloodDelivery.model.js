"use strict";
const mongoose = require("mongoose");
const { BLOOD_DELIVERY_STATUS } = require("../constants/enum");
const { generateUniqueCodeSafe } = require("../utils/codeGenerator");

const DOCUMENT_NAME = "BloodDelivery";
const COLLECTION_NAME = "BloodDeliveries";

const bloodDeliverySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      index: true,
      unique: true,
    },
    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    facilityToAddress: {
      type: String,
      required: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: Date,
    },
    bloodUnits: [{
      unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BloodUnit",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    transporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BLOOD_DELIVERY_STATUS),
      default: BLOOD_DELIVERY_STATUS.PENDING,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityStaff",
      required: true,
    },
    note: {
      type: String,
    },
    startDeliveryAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

bloodDeliverySchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.code) {
      this.code = await generateUniqueCodeSafe(
        mongoose.model(DOCUMENT_NAME),
        "DELI",
        "code"
      );
    }
  }
  next();
});

bloodDeliverySchema.index({ currentLocation: "2dsphere" });


bloodDeliverySchema.index({ bloodRequestId: 1 });
bloodDeliverySchema.index({ facilityId: 1 });
bloodDeliverySchema.index({ status: 1 });
bloodDeliverySchema.index({ deliveredAt: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, bloodDeliverySchema);
