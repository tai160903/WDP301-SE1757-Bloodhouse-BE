"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { getInfoData } = require("../utils");
const {
  USER_ROLE,
  USER_STATUS,
  STAFF_POSITION,
  SEX,
} = require("../constants/enum");

const { BadRequestError } = require("../configs/error.response");
const { createTokenPair, verifyToken } = require("../auth/jwt");
const crypto = require("crypto");

const {
  validatePhone,
  validateEmail,
  validateIdCard,
} = require("../utils/validation");
const facilityStaffModel = require("../models/facilityStaff.model");

class AccessService {
  // signUp = async ({
  //   fullName,
  //   email,
  //   password,
  //   sex,
  //   yob,
  //   phone,
  //   address,
  //   idCard,
  // }) => {
  //   // Validate required fields
  //   if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
  //     throw new BadRequestError(
  //       "Full name is required and must be a non-empty string"
  //     );
  //   }

  //   if (idCard && !validateIdCard(idCard)) {
  //     throw new BadRequestError("Id card number is invalid");
  //   }

  //   if (typeof idCard !== "string" || idCard.trim() === "") {
  //     throw new BadRequestError("idCard must be a non-empty string");
  //   }

  //   if (!email || !validateEmail(email)) {
  //     throw new BadRequestError("Email is required and must be valid");
  //   }

  //   if (!password || typeof password !== "string" || password.length < 6) {
  //     throw new BadRequestError(
  //       "Password is required and must be at least 6 characters"
  //     );
  //   }

  //   // Validate optional fields
  //   if (sex && !Object.values(SEX).includes(sex)) {
  //     throw new BadRequestError(
  //       `Sex must be one of: ${Object.values(SEX).join(", ")}`
  //     );
  //   }

  //   if (yob && isNaN(Date.parse(yob))) {
  //     throw new BadRequestError("Year of birth (yob) must be a valid date");
  //   }

  //   if (phone && !validatePhone(phone)) {
  //     throw new BadRequestError("Phone number is invalid");
  //   }

  //   if (address && (typeof address !== "string" || address.trim() === "")) {
  //     throw new BadRequestError("Address must be a non-empty string");
  //   }

  //   // Step 1: Check if email, phone, idCard exists
  //   const existingUser = await userModel.findOne({
  //     email: email.trim().toLowerCase(),
  //   });
  //   if (existingUser) {
  //     throw new BadRequestError("Email already exists");
  //   }
  //   const existingPhone = await userModel.findOne({ phone: phone?.trim() });
  //   if (existingPhone) {
  //     throw new BadRequestError("Phone number already exists");
  //   }

  //   const existingIdCard = await userModel.findOne({
  //     idCard: idCard?.trim(),
  //   });
  //   if (existingIdCard) {
  //     throw new BadRequestError("Id card number already exists");
  //   }

  //   // Step 2: Hash password and create new user
  //   const passwordHash = await bcrypt.hash(password, 10);
  //   const verifyToken = crypto.randomBytes(32).toString("hex");

  //   const newUser = await userModel.create({
  //     fullName: fullName.trim(),
  //     email: email.trim().toLowerCase(),
  //     password: passwordHash,
  //     role: USER_ROLE.MEMBER,
  //     verifyToken,
  //     sex,
  //     yob: yob ? new Date(yob) : undefined,
  //     phone: phone ? phone.trim() : undefined,
  //     address: address ? address.trim() : undefined,
  //     idCard: idCard ? idCard.trim() : undefined,
  //   });

  //   if (newUser) {
  //     // Step 3: Create token pair
  //     const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
  //     const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

  //     const tokens = await createTokenPair(
  //       { userId: newUser._id, email: newUser.email, role: newUser.role },
  //       accessTokenKey,
  //       refreshTokenKey,
  //       process.env.ACCESS_TOKEN_EXPIRES_IN,
  //       process.env.REFRESH_TOKEN_EXPIRES_IN
  //     );

  //     // Step 4: Return result
  //     return {
  //       user: getInfoData({
  //         fields: ["_id", "fullName", "email", "role"],
  //         object: newUser,
  //       }),
  //       tokens,
  //     };
  //   }

  //   throw new BadRequestError("User registration failed");
  // };

  signUp = async ({ email, password }) => {
    // Validate required fields
    console.log("email", email);
    console.log("password", password);

    if (!email || !validateEmail(email)) {
      throw new BadRequestError("Email is required and must be valid");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new BadRequestError(
        "Password is required and must be at least 6 characters"
      );
    }

    // Validate optional fields

    // Step 1: Check if email, phone, idCard exists
    const existingUser = await userModel.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    // Step 2: Hash password and create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const newUser = await userModel.create({
      email: email.trim().toLowerCase(),
      password: passwordHash,
      role: USER_ROLE.MEMBER,
      verifyToken,
    });

    if (newUser) {
      // Step 3: Create token pair
      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      const tokens = await createTokenPair(
        { userId: newUser._id, email: newUser.email, role: newUser.role },
        accessTokenKey,
        refreshTokenKey,
        process.env.ACCESS_TOKEN_EXPIRES_IN,
        process.env.REFRESH_TOKEN_EXPIRES_IN
      );

      // Step 4: Return result
      return {
        user: getInfoData({
          fields: ["_id", "fullName", "email", "role"],
          object: newUser,
        }),
        tokens,
      };
    }

    throw new BadRequestError("User registration failed");
  };

  signIn = async ({ emailOrPhone, password, refreshToken = null }) => {
    if (!emailOrPhone || !password) {
      throw new BadRequestError("Email/Phone and password are required");
    }

    // Step 1: Tìm user theo email hoặc phone
    let foundUser;
    if (validateEmail(emailOrPhone)) {
      foundUser = await userModel.findOne({
        email: emailOrPhone.trim().toLowerCase(),
      });
    } else {
      // Tìm theo phone (bỏ khoảng trắng nếu có)
      foundUser = await userModel.findOne({ phone: emailOrPhone.trim() });
    }

    if (!foundUser) {
      throw new BadRequestError("Email or phone does not exist");
    }

    // Step 2: Kiểm tra trạng thái tài khoản
    if (foundUser.status !== USER_STATUS.ACTIVE) {
      throw new BadRequestError("Account is inactive");
    }

    // Step 3: Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      throw new BadRequestError("Password is incorrect");
    }

    // Step 4: Lấy các biến môi trường cho token
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;
    const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

    if (!accessTokenKey || !refreshTokenKey) {
      throw new Error("Secret keys are not defined in environment variables");
    }

    const payload = {
      userId: foundUser._id,
      email: foundUser.email,
      role: foundUser.role,
    };
    // Kiểm tra role user
    if (
      foundUser.role === USER_ROLE.MANAGER ||
      foundUser.role === USER_ROLE.DOCTOR ||
      foundUser.role === USER_ROLE.NURSE
    ) {
      const staff = await facilityStaffModel.findOne({
        userId: foundUser._id,
      });

      if (staff) {
        payload.facilityId = staff.facilityId;
        payload.staffId = staff._id;
      }
    }

    // Step 5: Tạo token pair
    const tokens = await createTokenPair(
      payload,
      accessTokenKey,
      refreshTokenKey,
      accessTokenExpiresIn,
      refreshTokenExpiresIn
    );

    // Step 6: Get user info
    const userData = getInfoData({
      fields: [
        "_id",
        "fullName",
        "email",
        "role",
        "avatar",
        "address",
        "phone",
        "sex",
        "yob",
        "status",
        "profileLevel",
      ],
      object: foundUser,
    });

    // Step 7: Nếu là staff thì lấy thêm facilityId
    const STAFF_POSITION = [
      USER_ROLE.MANAGER,
      USER_ROLE.DOCTOR,
      USER_ROLE.NURSE,
    ];
    if (STAFF_POSITION.includes(foundUser.role)) {
      const staffRecord = await facilityStaffModel
        .findOne({
          userId: foundUser._id,
          isDeleted: { $ne: true },
        })
        .populate("facilityId", "name");

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

  refreshToken = async ({ userId, refreshToken }) => {
    if (!userId || !refreshToken) {
      throw new BadRequestError("userId and refreshToken are required");
    }

    const decodedToken = await verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE
    );
    if (!decodedToken) {
      throw new BadRequestError("Invalid refresh token");
    }

    if (decodedToken.userId !== userId) {
      throw new BadRequestError("Invalid user ID");
    }

    if (decodedToken.exp * 1000 < Date.now()) {
      throw new BadRequestError("Refresh token has expired");
    }

    const foundUser = await userModel.findById(userId);
    if (!foundUser) {
      throw new BadRequestError("User not found");
    }

    // Step 1: Tạo token pair mới
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

    if (!accessTokenKey || !refreshTokenKey) {
      throw new Error("Secret keys are not defined in environment variables");
    }

    const tokens = await createTokenPair(
      { userId: foundUser._id, email: foundUser.email, role: foundUser.role },
      accessTokenKey,
      refreshTokenKey,
      process.env.ACCESS_TOKEN_EXPIRES_IN,
      process.env.REFRESH_TOKEN_EXPIRES_IN
    );

    return {
      user: getInfoData({
        fields: ["_id", "fullName", "email", "role"],
        object: foundUser,
      }),
      tokens,
    };
  };
}

module.exports = new AccessService();
