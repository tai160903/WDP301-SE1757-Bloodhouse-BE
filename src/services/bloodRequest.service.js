"use strict";

const BloodRequest = require("../models/bloodRequest.model");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../configs/error.response");
const { BLOOD_REQUEST_STATUS, BLOOD_COMPONENT } = require("../constants/enum");
const bloodGroupModel = require("../models/bloodGroup.model");
const userModel = require("../models/user.model");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const notificationService = require("./notification.service");

class BloodRequestService {
  requestFields = [
    "_id",
    "groupId",
    "userId",
    "facilityId",
    "patientName",
    "patientPhone",
    "patientAge",
    "bloodComponent",
    "quantity",
    "isUrgent",
    "status",
    "location",
    "address",
    "contactName",
    "contactPhone",
    "contactEmail",
    "reason",
    "medicalDetails",
    "medicalDocumentUrl",
    "note",
    "preferredDate",
    "scheduleDate",
    "consent",
    "createdAt",
    "updatedAt",
    "hasCampaign",
    "isFulfilled",
  ];

  // Tạo yêu cầu máu
  createBloodRequest = async ({ groupId, files, ...requestData }, userId) => {
    // Step 1: Lấy thông tin người dùng
    const user = await userModel.findById(userId);
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }

    // Step 2: Resolve bloodId từ bloodType
    const bloodGroup = await bloodGroupModel.findOne({ _id: groupId });
    if (!bloodGroup) {
      throw new BadRequestError("Nhóm máu không hợp lệ");
    }

    // Step 3: Validate dữ liệu bắt buộc
    if (
      !requestData.componentId ||
      !requestData.quantity ||
      !requestData.preferredDate ||
      !requestData.consent
    ) {
      throw new BadRequestError(
        "Thiếu thông tin bắt buộc: thành phần máu, số lượng, ngày yêu cầu, hoặc đồng ý"
      );
    }

    if (requestData.consent !== "true" && requestData.consent !== true) {
      throw new BadRequestError("Cần đồng ý với các điều khoản và điều kiện");
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
      groupId: bloodGroup._id,
      userId,
      facilityId: requestData.facilityId,
      componentId: requestData.componentId,
      quantity: parseInt(requestData.quantity),
      isUrgent:
        requestData.isUrgent === "true" || requestData.isUrgent === true,
      status: BLOOD_REQUEST_STATUS.PENDING_APPROVAL,
      patientName: user.fullName,
      patientPhone: user.phone,
      address: requestData.address,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(requestData.longitude) || 0,
          parseFloat(requestData.latitude) || 0,
        ],
      },
      medicalDocumentUrl: medicalDocumentUrls,
      note: requestData.note,
      preferredDate: new Date(requestData.preferredDate),
    });

    // Step 6: Populate và trả về dữ liệu
    const result = await bloodRequest.populate(
      "userId",
      "fullName email phone"
    );
    return getInfoData({
      fields: [
        "_id",
        "groupId",
        "userId",
        "facilityId",
        "patientName",
        "patientPhone",
        "patientAge",
        "bloodComponent",
        "quantity",
        "isUrgent",
        "status",
        "location",
        "address",
        "contactName",
        "contactPhone",
        "contactEmail",
        "reason",
        "medicalDetails",
        "medicalDocumentUrl",
        "note",
        "preferredDate",
        "consent",
        "createdAt",
        "updatedAt",
        "hasCampaign",
        "isFulfilled",
      ],
      object: result,
    });
  };

  // Lấy danh sách yêu cầu máu của cơ sở
  getFacilityBloodRequests = async (
    facilityId,
    {
      page = 1,
      limit = 10,
      status,
      isUrgent,
      hasCampaign,
      isFulfilled,
      search,
      sortBy = "createdAt",
      sortOrder = -1,
    }
  ) => {
    const query = { facilityId };
    if (status) {
      if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
        throw new BadRequestError("Trạng thái không hợp lệ");
      }
      query.status = status;
    }
    if (isUrgent) {
      query.isUrgent = isUrgent;
    }
    if (hasCampaign) {
      query.hasCampaign = hasCampaign;
    }
    if (isFulfilled) {
      query.isFulfilled = isFulfilled;
    }
    // Validate sortBy
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "quantity",
      "status",
      "preferredDate",
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Trường sắp xếp không hợp lệ. Các trường hợp lệ: ${validSortFields.join(
          ", "
        )}`
      );
    }

    // Xây dựng object sort
    const sort = { [sortBy]: parseInt(sortOrder) };

    return await getPaginatedData({
      model: BloodRequest,
      query,
      page,
      limit,
      select:
        "_id bloodId patientPhone hasCampaign isFulfilled componentId userId facilityId patientName patientAge bloodComponent quantity isUrgent status location address contactName contactPhone contactEmail reason medicalDetails medicalDocumentUrl note preferredDate consent createdAt updatedAt",
      populate: [
        { path: "groupId", select: "name" },
        { path: "userId", select: "fullName email phone" },
        { path: "facilityId", select: "name address" },
        { path: "componentId", select: "name" },
      ],
      search,
      searchFields: ["patientName", "contactName", "reason"],
      sort,
    });
  };

  // Lấy chi tiết yêu cầu máu của người dùng
  getUserBloodRequestDetails = async (id, userId) => {
    const bloodRequest = await BloodRequest.findOne({ _id: id, userId })
      .populate("groupId", "name")
      .populate("componentId", "name")
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("staffId", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc bạn không có quyền truy cập"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "staffId"]),
        object: bloodRequest,
      }),
    };
  };

  // Lấy danh sách yêu cầu máu của người dùng
  getUserBloodRequests = async (
    userId,
    {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = -1,
    }
  ) => {
    const query = { userId };
    if (status) {
      if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
        throw new BadRequestError("Trạng thái không hợp lệ");
      }
      query.status = status;
    }

    // Validate sortBy
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "quantity",
      "status",
      "preferredDate",
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Trường sắp xếp không hợp lệ. Các trường hợp lệ: ${validSortFields.join(
          ", "
        )}`
      );
    }

    // Xây dựng object sort
    const sort = { [sortBy]: parseInt(sortOrder) };

    return await getPaginatedData({
      model: BloodRequest,
      query,
      page,
      limit,
      select: this.requestFields.join(" "),
      populate: [
        { path: "groupId", select: "name" },
        { path: "userId", select: "fullName email phone" },
        { path: "facilityId", select: "name address" },
        { path: "componentId", select: "name" },
      ],
      search,
      searchFields: ["patientName", "contactName", "reason"],
      sort,
    });
  };

  // Lấy chi tiết yêu cầu máu
  getBloodRequestDetails = async (id, userId, facilityId) => {
    const query = { _id: id };
    if (!userId && !facilityId) {
      throw new BadRequestError(
        "Yêu cầu userId hoặc facilityId để xem chi tiết"
      );
    }
    if (userId) {
      query.userId = userId;
    } else if (facilityId) {
      query.facilityId = facilityId;
    }

    const bloodRequest = await BloodRequest.findOne(query)
      .populate("groupId", "name")
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("staffId", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc bạn không có quyền truy cập"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "staffId"]),
        object: bloodRequest,
      }),
    };
  };

  // Lấy danh sách yêu cầu máu của cơ sở theo người dùng
  getFacilityBloodRequestsByUser = async (
    facilityId,
    userId,
    {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = -1,
    }
  ) => {
    const query = { facilityId, userId };
    if (status) {
      if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
        throw new BadRequestError("Trạng thái không hợp lệ");
      }
      query.status = status;
    }

    // Validate sortBy
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "quantity",
      "status",
      "preferredDate",
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Trường sắp xếp không hợp lệ. Các trường hợp lệ: ${validSortFields.join(
          ", "
        )}`
      );
    }

    // Xây dựng object sort
    const sort = { [sortBy]: parseInt(sortOrder) };

    return await getPaginatedData({
      model: BloodRequest,
      query,
      page,
      limit,
      select: this.requestFields.join(" "),
      populate: [
        { path: "groupId", select: "name" },
        { path: "userId", select: "fullName email phone" },
        { path: "facilityId", select: "name address" },
      ],
      search,
      searchFields: ["patientName", "contactName", "reason"],
      sort,
    });
  };

  // Lấy chi tiết yêu cầu máu của cơ sở
  getFacilityBloodRequestDetails = async (id, facilityId) => {
    const bloodRequest = await BloodRequest.findOne({ _id: id, facilityId })
      .populate("groupId", "name")
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("staffId", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc không thuộc cơ sở này"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "staffId"]),
        object: bloodRequest,
      }),
    };
  };

  // Cập nhật trạng thái yêu cầu máu
  updateBloodRequestStatus = async (
    id,
    facilityId,
    { status, staffId, scheduleDate }
  ) => {
    if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
      throw new BadRequestError("Trạng thái không hợp lệ");
    }
    if (status === "approved") {
      if (!scheduleDate) {
        throw new BadRequestError("Ngày thực hiện không được để trống");
      }
    }
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      facilityId,
    })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name");
    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc không thuộc cơ sở này"
      );
    }

    bloodRequest.status = status;
    if (staffId) {
      bloodRequest.staffId = staffId;
    }
    if (scheduleDate) {
      bloodRequest.scheduleDate = scheduleDate;
    }
    await bloodRequest.save();

    await notificationService.sendBloodRequestStatusNotification(
      bloodRequest.userId,
      status,
      bloodRequest.facilityId.name,
      bloodRequest._id
    );

    return {
      data: getInfoData({
        fields: ["_id", "status", "staffId", "updatedAt"],
        object: bloodRequest,
      }),
    };
  };
}

module.exports = new BloodRequestService();
