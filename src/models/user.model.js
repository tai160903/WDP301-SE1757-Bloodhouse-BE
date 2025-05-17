"use strict";
const mongoose = require("mongoose");
const { USER_ROLE, SEX, USER_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new mongoose.Schema(
  {
    bloodId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodGroup" },
    role: { type: String, enum: Object.values(USER_ROLE), default: USER_ROLE.MEMBER },
    idCard: { type: String },
    avatar: { type: String, trim: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true },
    verify: { type: Boolean, default: false },
    verifyToken: { type: String },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
    yob: { type: Date },
    sex: { type: String, enum: Object.values(SEX) },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);