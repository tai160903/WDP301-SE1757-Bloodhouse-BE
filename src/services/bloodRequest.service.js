"use strict";

const BloodRequest = require("../models/bloodRequest.model");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../configs/error.response");
const { BLOOD_REQUEST_STATUS, BLOOD_COMPONENT } = require("../constants/enum");
const bloodGroupModel = require("../models/bloodGroup.model");
const userModel = require("../models/user.model");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");

class BloodRequestService {
  // Tạo yêu cầu máu
createBloodRequest = async ({ bloodType, files, ...requestData }, userId) => {
  // Step 1: Lấy thông tin người dùng
  const user = await userModel.findById(userId);
  if (!user) {
    throw new BadRequestError("Người dùng không tồn tại");
  }

  // Step 2: Resolve bloodId từ bloodType
  const bloodGroup = await bloodGroupModel.findOne({ name: bloodType });
  if (!bloodGroup) {
    throw new BadRequestError("Nhóm máu không hợp lệ");
  }

  // Step 3: Validate dữ liệu bắt buộc
  if (
    !requestData.bloodComponent ||
    !requestData.quantity ||
    !requestData.preferredDate ||
    !requestData.consent
  ) {
    throw new BadRequestError(
      "Thiếu thông tin bắt buộc: thành phần máu, số lượng, ngày yêu cầu, hoặc đồng ý"
    );
  }

  if (!Object.values(BLOOD_COMPONENT).includes(requestData.bloodComponent)) {
    throw new BadRequestError("Thành phần máu không hợp lệ");
  }

  if (parseInt(requestData.quantity) < 1) {
    throw new BadRequestError("Số lượng phải là số dương");
  }

  // Step 4: Xử lý file tải lên (1-5 file)
  let medicalDocumentUrls = [];
  if (files && files.length > 0) {
    if (files.length > 5) {
      throw new BadRequestError("Chỉ được tải lên tối đa 5 file");
    }
    if (files.length < 1) {
      throw new BadRequestError("Cần tải lên ít nhất 1 file");
    }
    medicalDocumentUrls = await Promise.all(
      files.map((file) =>
        uploadSingleImage({
          file,
          folder: "bloodhouse/medical-documents",
          options: { resource_type: "auto" },
        }).then((result) => result.url)
      )
    );
  } else {
    throw new BadRequestError("Cần tải lên ít nhất 1 file tài liệu y tế");
  }

  // Step 5: Tạo yêu cầu máu
  const bloodRequest = await BloodRequest.create({
    bloodId: bloodGroup._id,
    userId,
    patientName: user.fullName,
    patientAge: user.age || "",
    contactName: user.fullName,
    contactPhone: user.phone || "",
    contactEmail: user.email,
    bloodComponent: requestData.bloodComponent,
    quantity: parseInt(requestData.quantity),
    isUrgent: requestData.isUrgent === "true" || requestData.isUrgent === true,
    status: BLOOD_REQUEST_STATUS.PENDING,
    location: {
      type: "Point",
      coordinates: [parseFloat(requestData.lng) || 0, parseFloat(requestData.lat) || 0],
    },
    street: requestData.street,
    city: requestData.city,
    reason: requestData.reason,
    medicalDetails: requestData.medicalDetails,
    medicalDocumentUrl: medicalDocumentUrls,
    note: requestData.note,
    preferredDate: new Date(requestData.preferredDate),
    consent: requestData.consent === "true" || requestData.consent === true,
    facilityId: requestData.facilityId,
  });

  // Step 6: Populate và trả về dữ liệu
  const result = await bloodRequest.populate("userId", "fullName email phone");
  console.log("🚀 ~ BloodRequestService ~ createBloodRequest= ~ result:", result)
  return getInfoData({
      fields: ["_id", "bloodId", "userId", "facilityId", "patientName", "patientAge", "bloodComponent", "quantity", "isUrgent", "status", "location", "street", "city", "contactName", "contactPhone", "contactEmail", "reason", "medicalDetails", "medicalDocumentUrl", "note", "preferredDate", "consent", "createdAt", "updatedAt"],
      object: result,
    });
  };
}

module.exports = new BloodRequestService();