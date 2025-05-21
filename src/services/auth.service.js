"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { getInfoData } = require("../utils");
const { USER_ROLE, USER_STATUS, STAFF_POSITION } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");
const { createTokenPair } = require("../auth/jwt");
const crypto = require("crypto");
const facilityStaffModel = require("../models/facilityStaff.model");

class AccessService {
  signUp = async ({ full_name, email, password }) => {
    // Step 1: Check if email exists
    console.log("email", email);
    console.log("password", password);
    console.log("full_name", full_name);
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    // Step 2: Hash password and create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const newUser = await userModel.create({
      full_name,
      email,
      password: passwordHash,
      role: USER_ROLE.MEMBER,
      verifyToken,
    });

    if (newUser) {
      // Step 3: Create token pair
      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      const tokens = await createTokenPair(
        { userId: newUser._id, email, role: newUser.role },
        accessTokenKey,
        refreshTokenKey,
        process.env.ACCESS_TOKEN_EXPIRES_IN,
        process.env.REFRESH_TOKEN_EXPIRES_IN
      );

      // Step 5: Trả về kết quả
      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role"],
          object: newUser,
        }),
        tokens,
      };
    }

    return {
      data: null,
    };
  };

  signIn = async ({ email, password, refreshToken = null }) => {
    // Step 1: Check if email exists
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      throw new BadRequestError("Email not exists");
    }

    // Step 2: Check if account is active
    if (foundUser.status !== USER_STATUS.ACTIVE) {
      throw new BadRequestError("Account is inactive");
    }

    // Step 3: Check if password is correct
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      throw new BadRequestError("Password is incorrect");
    }

    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;
    const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

    // Kiểm tra xem các khóa có tồn tại không
    if (!accessTokenKey || !refreshTokenKey) {
      throw new Error("Secret keys are not defined in environment variables");
    }

    // Step 5: Create token pair
    const tokens = await createTokenPair(
      { userId: foundUser._id, email, role: foundUser.role },
      accessTokenKey,
      refreshTokenKey,
      accessTokenExpiresIn,
      refreshTokenExpiresIn
    );

    // Step 6: Get user info
    const userData = getInfoData({
      fields: ["_id", "fullName", "email", "role", "avatar"],
      object: foundUser,
    });

    // Step 7: Nếu là staff thì lấy thêm facilityId
    const STAFF_POSITION = [USER_ROLE.MANAGER, USER_ROLE.DOCTOR, USER_ROLE.NURSE];
    if (STAFF_POSITION.includes(foundUser.role)) {
      const staffRecord = await facilityStaffModel
        .findOne({
          userId: foundUser._id,
          isDeleted: { $ne: true },
        })
        .populate("facilityId", "name")

      if (staffRecord) {
        userData.facilityId = staffRecord.facilityId._id;
        userData.position = staffRecord.position;
        userData.facilityName = staffRecord.facilityId.name;
      }
    }

    return {
      user: userData,
      tokens,
    };
  };

  signOut = async ({ userId }) => {
    try {
      if (!userId) {
        throw new BadRequestError("userId is required");
      }

      const foundUser = await userModel.findById(userId);
      if (!foundUser) {
        throw new BadRequestError("User not found");
      }
      return {
        message: "Logout successful",
      };
    } catch (error) {
      throw new BadRequestError(error.message || "Logout failed");
    }
  };
}

module.exports = new AccessService();
