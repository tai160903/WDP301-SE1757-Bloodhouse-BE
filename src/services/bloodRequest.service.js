"use strict";

const BloodRequest = require("../models/bloodRequest.model");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../configs/error.response");
const {
  BLOOD_REQUEST_STATUS,
  BLOOD_DELIVERY_STATUS,
  STAFF_POSITION,
} = require("../constants/enum");
const bloodGroupModel = require("../models/bloodGroup.model");
const userModel = require("../models/user.model");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const notificationService = require("./notification.service");
const BloodRequestSupport = require("../models/bloodRequestSupport.model");
const bloodUnitModel = require("../models/bloodUnit.model");
const { BLOOD_UNIT_STATUS } = require("../constants/enum");
const bloodDeliveryModel = require("../models/bloodDelivery.model");
const facilityStaffModel = require("../models/facilityStaff.model");
const bloodDistributionLogModel = require("../models/bloodDistributionLog.model");
const bloodInventoryModel = require("../models/bloodInventory.model");
const facilityModel = require("../models/facility.model");
const { default: mongoose } = require("mongoose");
const { BLOOD_REQUEST_MESSAGE } = require("../constants/message");
const QRCode = require("qrcode");

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
    "scheduledDeliveryDate",
    "consent",
    "createdAt",
    "updatedAt",
    "isFulfilled",
    "componentId",
    "qrCodeUrl",
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
    if (!requestData.quantity || !requestData.preferredDate) {
      throw new BadRequestError(
        "Thiếu thông tin bắt buộc: số lượng, ngày yêu cầu"
      );
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

    if (!requestData.reason) {
      throw new BadRequestError("Thiếu thông tin bắt buộc: lý do");
    }

    // Step 5: Tạo yêu cầu máu
    const bloodRequest = await BloodRequest.create({
      groupId: bloodGroup._id,
      userId,
      facilityId: requestData.facilityId,
      componentId: requestData.componentId || null,
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
      reason: requestData.reason,
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
        "_id bloodId patientPhone isFulfilled componentId userId facilityId patientName patientAge bloodComponent quantity isUrgent status location address contactName contactPhone contactEmail reason medicalDetails medicalDocumentUrl note preferredDate consent createdAt updatedAt",
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
      .populate("approvedBy", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc bạn không có quyền truy cập"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "approvedBy"]),
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
      .populate("approvedBy", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc bạn không có quyền truy cập"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "approvedBy"]),
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
      .populate("componentId", "name")
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("approvedBy", "fullName email phone")
      .lean();

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc không thuộc cơ sở này"
      );
    }

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["facilityId", "approvedBy"]),
        object: bloodRequest,
      }),
    };
  };

  // Cập nhật trạng thái yêu cầu máu
  updateBloodRequestStatus = async (
    id,
    facilityId,
    { status, staffId, needsSupport, reasonRejected }
  ) => {
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      facilityId,
    })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name")
      .populate("groupId", "name")
      .populate("componentId", "name");

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc không thuộc cơ sở này"
      );
    }

    if (status) {
      if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
        console.log("status không hợp lệ");
        throw new BadRequestError("Trạng thái không hợp lệ");
      }
      bloodRequest.status = status;

      if (status === BLOOD_REQUEST_STATUS.REJECTED_REGISTRATION) {
        bloodRequest.reasonRejected = reasonRejected;
      }
    }

    if (staffId) {
      bloodRequest.approvedBy = staffId;
      bloodRequest.approvedAt = new Date();
    }
    if (needsSupport !== undefined) {
      bloodRequest.needsSupport = needsSupport;

      // Nếu cần hỗ trợ, tìm và gửi thông báo đến người dùng có thể hiến máu
      if (needsSupport === true) {
        // Lấy tất cả người dùng có nhóm máu trùng với nhóm máu của yêu cầu máu
        const potentialDonors = await userModel.find({
          bloodId: bloodRequest.groupId,
          isAvailable: true,
        });

        // Gửi thông báo đến người dùng có thể hiến máu
        for (const donor of potentialDonors) {
          await notificationService.sendBloodSupportRequestNotification(
            donor._id,
            bloodRequest.userId.fullName,
            bloodRequest.groupId.name,
            bloodRequest.componentId.name,
            bloodRequest._id
          );
        }
      }
    }

    await bloodRequest.save();

    // Gửi thông báo đến người dùng yêu cầu máu
    await notificationService.sendBloodRequestStatusNotification(
      bloodRequest.userId,
      status,
      bloodRequest.facilityId.name,
      bloodRequest._id,
      reasonRejected || ""
    );

    return {
      data: getInfoData({
        fields: [
          "_id",
          "status",
          "approvedBy",
          "needsSupport",
          "updatedAt",
          "reasonRejected",
        ],
        object: bloodRequest,
      }),
    };
  };

  updateBloodRequestComponent = async (id, facilityId, { componentId }) => {
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      facilityId,
    });

    if (!bloodRequest) {
      throw new BadRequestError(
        "Không tìm thấy yêu cầu máu hoặc không thuộc cơ sở này"
      );
    }

    bloodRequest.componentId = componentId;
    await bloodRequest.save();

    return {
      data: getInfoData({
        fields: this.requestFields.concat(["componentId"]),
        object: bloodRequest,
      }),
    };
  };

  getRequestBloodNeedSupport = async (userId) => {
    // B1: Lấy tất cả yêu cầu máu đã duyệt, chưa fulfill, chưa có lịch phân phối
    const requests = await BloodRequest.find({
      status: BLOOD_REQUEST_STATUS.APPROVED,
      isFulfilled: false,
      scheduledDeliveryDate: { $exists: false },
      needsSupport: true,
    })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("groupId", "name")
      .populate("componentId", "name")
      .sort({ isUrgent: -1, createdAt: -1 });

    const requestIds = requests.map((r) => r._id);

    // B2: Đếm số người đã duyệt và đang chờ duyệt cho từng request
    const supportStats = await BloodRequestSupport.aggregate([
      {
        $match: {
          requestId: { $in: requestIds },
        },
      },
      {
        $group: {
          _id: { requestId: "$requestId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // B3: Chuyển kết quả sang Map để tra nhanh
    const supportStatMap = {}; // { requestId: { approved: x, pending: y } }
    supportStats.forEach((item) => {
      const requestId = item._id.requestId.toString();
      const status = item._id.status;
      if (!supportStatMap[requestId]) {
        supportStatMap[requestId] = { approved: 0, pending: 0 };
      }
      if (status === "approved") {
        supportStatMap[requestId].approved = item.count;
      } else if (status === "pending") {
        supportStatMap[requestId].pending = item.count;
      }
    });

    const result = await Promise.all(
      requests.map(async (request) => {
        const detail = await this.getRequestBloodNeedSupportById(
          request._id,
          userId
        );

        const stat = supportStatMap[request._id.toString()] || {
          approved: 0,
          pending: 0,
        };

        detail.numberRegistered = stat.approved;
        detail.numberPending = stat.pending;

        return detail;
      })
    );

    return result;
  };

  getRequestBloodNeedSupportById = async (id, userId) => {
    const bloodRequest = await BloodRequest.findOne({
      _id: id,
      needsSupport: true,
    })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("groupId", "name")
      .populate("componentId", "name");
    if (!bloodRequest) {
      throw new BadRequestError("Không tìm thấy yêu cầu máu");
    }

    const numberRegistered = await BloodRequestSupport.countDocuments({
      requestId: bloodRequest._id,
    });

    const registered = await BloodRequestSupport.findOne({
      userId,
      requestId: bloodRequest._id,
    });

    const result = {
      ...bloodRequest.toObject(),
      isRegistered: registered ? true : false,
      numberRegistered,
    };

    return getInfoData({
      fields: this.requestFields.concat([
        "facilityId",
        "approvedBy",
        "isRegistered",
        "numberRegistered",
        "componentId",
      ]),
      object: result,
    });
  };

  getSupportRequestsForFacility = async (facilityId) => {
    const bloodRequest = await BloodRequest.find({
      facilityId,
      needsSupport: true,
    })
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("groupId", "name")
      .populate("componentId", "name")
      .sort({ isUrgent: -1, createdAt: -1 });
    return bloodRequest;
  };

  getSupportRequestDetails = async (id, facilityId, { status }) => {
    if (!id || !facilityId) {
      throw new BadRequestError("Yêu cầu id và facilityId");
    }
    const query = { _id: id, facilityId };

    if (status) {
      if (!Object.values(BLOOD_REQUEST_STATUS).includes(status)) {
        throw new BadRequestError("Trạng thái không hợp lệ");
      }
      query.status = status;
    }

    const bloodRequest = await BloodRequest.findOne(query)
      .populate("userId", "fullName email phone")
      .populate("facilityId", "name address")
      .populate("groupId", "name")
      .populate("componentId", "name");
    if (!bloodRequest) {
      throw new BadRequestError("Không tìm thấy yêu cầu máu");
    }
    return bloodRequest;
  };

  assignBloodUnitsToRequest = async ({
    requestId,
    facilityId,
    bloodUnits,
    transporterId,
    userId,
    note,
    scheduledDeliveryDate,
  }) => {
    // Step 0: Tạo session
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Step 1: Kiểm tra request có tồn tại và thuộc cơ sở này không
      const bloodRequest = await BloodRequest.findOne({
        _id: requestId,
        facilityId,
      })
        .populate("facilityId", "_id name address")
        .session(session);
      if (!bloodRequest) {
        throw new BadRequestError("Không tìm thấy yêu cầu máu");
      }

      // Step 2: Kiểm tra các bloodUnit hợp lệ
      const bloodUnitIds = bloodUnits.map((unit) => unit.unitId);
      const validUnits = await bloodUnitModel
        .find({
          _id: { $in: bloodUnitIds },
          facilityId,
          status: BLOOD_UNIT_STATUS.AVAILABLE,
          bloodGroupId: bloodRequest.groupId,
          componentId: bloodRequest.componentId,
          expiresAt: { $gt: new Date() },
          bloodRequestId: { $exists: false },
        })
        .session(session);
      if (validUnits.length !== bloodUnitIds.length) {
        throw new BadRequestError("Một số đơn vị máu không hợp lệ");
      }

      // Step 3: Kiểm tra số lượng và cập nhật remainingQuantity
      const updateOps = [];
      const logOps = [];

      for (const { unitId, quantity } of bloodUnits) {
        const unit = validUnits.find(
          (u) => u._id.toString() === unitId.toString()
        );
        if (!unit) {
          throw new BadRequestError("Đơn vị máu không hợp lệ");
        }

        const remaining = unit.remainingQuantity ?? unit.quantity;
        if (quantity > remaining) {
          throw new BadRequestError(
            "Số lượng máu yêu cầu vượt quá số lượng máu có sẵn"
          );
        }

        // Trừ remainingQuantity và cập nhật status
        updateOps.push({
          updateOne: {
            filter: { _id: unitId },
            update: {
              $set: {
                remainingQuantity: remaining - quantity,
                status:
                  remaining - quantity === 0
                    ? BLOOD_UNIT_STATUS.RESERVED
                    : BLOOD_UNIT_STATUS.AVAILABLE,
              },
            },
          },
        });

        // Tạo log phân phối máu
        logOps.push({
          bloodRequestId: requestId,
          bloodUnitId: unitId,
          quantityDistributed: quantity,
          assignedBy: userId,
        });
      }
      // Step 4: Ghi cập nhật vào DB
      if (updateOps.length) {
        await bloodUnitModel.bulkWrite(updateOps, { session });
        await bloodDistributionLogModel.insertMany(logOps, { session });
      }

      // Step 5: Cập nhật bloodInventory
      const bloodInventory = await bloodInventoryModel.findOne({
        facilityId,
        groupId: bloodRequest.groupId,
        componentId: bloodRequest.componentId,
      });
      if (!bloodInventory) {
        throw new BadRequestError("Không tìm thấy kho máu");
      }
      bloodInventory.totalQuantity -= bloodRequest.quantity;
      await bloodInventory.save({ session });

      // Step 6: Kiểm tra transporter có tồn tại và thuộc cơ sở này không
      const transporter = await facilityStaffModel
        .findOne({
          _id: transporterId,
          facilityId,
          position: STAFF_POSITION.TRANSPORTER,
        })
        .session(session);
      if (!transporter) {
        throw new BadRequestError(
          "Không tìm thấy transporter hoặc không thuộc cơ sở này"
        );
      }

      // Step 7: Tạo delivery
      const delivery = await bloodDeliveryModel.create(
        [
          {
            bloodRequestId: requestId,
            facilityId,
            facilityToAddress: bloodRequest.address,
            bloodUnits: bloodUnits.map((unit) => ({
              unitId: unit.unitId,
              quantity: unit.quantity,
            })),
            transporterId,
            assignedBy: userId,
            status: BLOOD_DELIVERY_STATUS.PENDING,
            note,
          },
        ],
        { session }
      );

      // Step 8: Cập nhật request
      const totalAssigned = bloodUnits.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const isFull = totalAssigned >= bloodRequest.quantity;
      bloodRequest.status = BLOOD_REQUEST_STATUS.ASSIGNED;
      bloodRequest.scheduledDeliveryDate = scheduledDeliveryDate;
      bloodRequest.isFulfilled = isFull;
      bloodRequest.needsSupport = !isFull;
      bloodRequest.distributedBy = userId;
      bloodRequest.distributedAt = new Date();

      // Step 9: Tạo QR code cho delivery
      const deliveryId = delivery[0]._id;
      const qrData = {
        type: "blood_delivery",
        deliveryId: deliveryId,
        requestId: bloodRequest._id,
        facilityId: bloodRequest.facilityId._id,
        recipientId: bloodRequest.userId,
        timestamp: new Date().toISOString(),
      };
      try {
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
        bloodRequest.qrCodeUrl = qrCodeUrl;
      } catch (error) {
        throw new BadRequestError(
          BLOOD_REQUEST_MESSAGE.FAILED_TO_GENERATE_QR_CODE
        );
      }
      await bloodRequest.save({ session });

      // Step 10: Gửi thông báo đến người dùng yêu cầu máu
      const transporterUser = await facilityStaffModel.findOne({
        _id: transporterId,
        facilityId,
        position: STAFF_POSITION.TRANSPORTER,
      });
      if (!transporterUser) {
        throw new BadRequestError("Không tìm thấy người dùng");
      }
      const $userNotification =
        notificationService.sendBloodRequestStatusNotification(
          bloodRequest.userId,
          BLOOD_REQUEST_STATUS.ASSIGNED,
          bloodRequest.facilityId.name,
          bloodRequest._id
        );
      const $transporterNotification =
        notificationService.sendBloodRequestStatusNotificationToTransporter(
          transporterUser.userId,
          BLOOD_DELIVERY_STATUS.PENDING,
          bloodRequest.facilityId.name,
          deliveryId
        );

      await Promise.all([$userNotification, $transporterNotification]).catch(
        (error) => {
          console.log(error);
        }
      );

      await session.commitTransaction();
      session.endSession();
      return delivery;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };
}

module.exports = new BloodRequestService();
