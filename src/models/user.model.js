"use strict";
const mongoose = require("mongoose");
const {
  USER_ROLE,
  SEX,
  USER_STATUS,
  PROFILE_LEVEL,
} = require("../constants/enum");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new mongoose.Schema(
  {
    bloodId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup" },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.MEMBER,
    },
    idCard: { type: String, trim: true, unique: true },
    avatar: {
      type: String,
      trim: true,
      default:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true },
    verifyOTP: { type: String },
    verifyExpires: { type: Date },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    profileLevel: {
      type: Number,
      enum: Object.values(PROFILE_LEVEL),
      default: PROFILE_LEVEL.BASIC,
    },
    expoPushToken: { type: String, trim: true },
    yob: { type: Date },
    sex: { type: String, enum: Object.values(SEX) },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true, unique: true },
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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

// Tạo index 2dsphere cho trường location
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
