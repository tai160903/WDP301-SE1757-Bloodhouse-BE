"use strict";

const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const {
  BLOOD_DONATION_REGISTRATION_STATUS,
  USER_ROLE,
  BLOOD_DONATION_STATUS,
  HEALTH_CHECK_STATUS,
} = require("../constants/enum");
const userModel = require("../models/user.model");
const facilityModel = require("../models/facility.model");
const notificationService = require("./notification.service");
const bloodGroupModel = require("../models/bloodGroup.model");
const {
  USER_MESSAGE,
  FACILITY_MESSAGE,
  BLOOD_GROUP_MESSAGE,
  BLOOD_DONATION_REGISTRATION_MESSAGE
} = require("../constants/message");
const QRCode = require("qrcode");
const { getPaginatedData, populateExistingDocument, createNestedPopulateConfig } = require("../helpers/mongooseHelper");
const processDonationLogService = require("./processDonationLog.service");
const donorStatusLogService = require("./donorStatusLog.service");
const facilityStaffModel = require("../models/facilityStaff.model");
const healthCheckModel = require("../models/healthCheck.model");
class BloodDonationService {
  /** BLOOD DONATION REGISTRATION */
  // Đăng ký hiến máu
  createBloodDonationRegistration = async ({
    userId,
    facilityId,
    bloodGroupId,
    preferredDate,
    expectedQuantity,
    source,
    notes,
  }) => {
    // Kiểm tra user và facility
    const [user, facility, bloodGroup] = await Promise.all([
      userModel.findOne({ _id: userId }),
      facilityModel.findOne({ _id: facilityId }),
      bloodGroupModel.findOne({ _id: bloodGroupId }),
    ]);
    if (!user) throw new NotFoundError(USER_MESSAGE.USER_NOT_FOUND);
    if (!facility) throw new NotFoundError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
    if (!bloodGroup)
      throw new NotFoundError(BLOOD_GROUP_MESSAGE.BLOOD_GROUP_NOT_FOUND);

    // Kiểm tra xem người dùng có đăng ký nào đang chờ xử lý không
    // const pendingRegistration = await bloodDonationRegistrationModel.findOne({
    //   userId,
    //   status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
    // });

    // if (pendingRegistration) {
    //   throw new BadRequestError(USER_MESSAGE.USER_HAS_PENDING_REGISTRATION);
    // }

    // Lấy lần hiến máu gần nhất
    const lastDonation = await bloodDonationModel
      .findOne({ userId })
      .sort({ donationDate: -1 });

    if (lastDonation) {
      const lastDonationDate = new Date(lastDonation.donationDate);
      const currentDate = new Date();
      const monthsDiff =
        (currentDate.getFullYear() - lastDonationDate.getFullYear()) * 12 +
        (currentDate.getMonth() - lastDonationDate.getMonth());

      // Kiểm tra thời gian chờ dựa trên giới tính
      const requiredMonths = user.gender === "female" ? 4 : 3;
      if (monthsDiff < requiredMonths) {
        throw new BadRequestError(
          `Bạn cần đợi đủ ${requiredMonths} tháng kể từ lần hiến máu trước (${lastDonationDate.toLocaleDateString(
            "vi-VN"
          )})`
        );
      }
    }

    // Lấy location từ profile người dùng
    const location = user.location || { type: "Point", coordinates: [0, 0] };

    const registration = await bloodDonationRegistrationModel.create({
      userId,
      facilityId,
      bloodGroupId,
      preferredDate,
      source,
      expectedQuantity,
      notes,
      location,
    });

    // Tạo log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId,
      changedBy: null,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      notes: "Đăng ký hiến máu",
    });

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "preferredDate",
        "status",
        "source",
        "notes",
        "location",
        "code",
        "createdAt",
        "expectedQuantity",
      ],
      object: registration,
    });
  };

  // Lấy danh sách đăng ký hiến máu
  getBloodDonationRegistrations = async ({
    status,
    facilityId,
    limit = 10,
    page = 1,
  }) => {
    const query = {};
    if (status) query.status = status;
    if (facilityId) query.facilityId = facilityId;

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select:
        "_id userId facilityId bloodGroupId code preferredDate status source notes createdAt expectedQuantity",
      populate: [
        { path: "userId", select: "fullName email phone avatar gender" },
        { path: "facilityId", select: "name street city" },
        { path: "bloodGroupId", select: "name" },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Cập nhật đăng ký hiến máu
  updateBloodDonationRegistration = async ({
    registrationId,
    changedBy,
    status,
    staffId,
    notes,
  }) => {
    // Step 1: Find registration
    const registration = await bloodDonationRegistrationModel
      .findById(registrationId)
      .populate("facilityId", "name");
    if (!registration) throw new NotFoundError(BLOOD_DONATION_REGISTRATION_MESSAGE.BLOOD_DONATION_REGISTRATION_NOT_FOUND);

    // Step 2: Validate status
    if (!Object.values(BLOOD_DONATION_REGISTRATION_STATUS).includes(status)) {
      throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.INVALID_STATUS);
    }

    // Step 3: Handle REGISTERED or REJECTED_REGISTRATION status
    if (
      [
        BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
        BLOOD_DONATION_REGISTRATION_STATUS.REJECTED_REGISTRATION,
      ].includes(status)
    ) {
      // If REGISTERED, staffId is required
      // if (status === BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED ) {
      //   throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.STAFF_ID_REQUIRED);
      // }

      registration.status = status;

      if (status === BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED) {
        // Step 4: Create QR code
        const qrData = {
          registrationId: registration._id,
          userId: registration.userId,
          bloodGroupId: registration.bloodGroupId,
        };
        try {
          const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
          registration.qrCodeUrl = qrCodeUrl;
        } catch (error) {
          throw new BadRequestError(BLOOD_DONATION_REGISTRATION_MESSAGE.FAILED_TO_GENERATE_QR_CODE);
        }
      }
    } else {
      // Other statuses only update status and notes
      registration.status = status;
      if(status === BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN) {
        registration.checkInAt = new Date();
      }
    }

    // Step 5: Update notes if provided
    if (notes) {
      registration.notes = notes;
    }

    // Step 6: Save changes
    await registration.save();

    // Step 7: Send notification to user
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      registration.userId,
      status,
      registration.facilityId.name,
      registration._id
    );

    // Step 8: Create process donation log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: registration.userId,
      changedBy,
      status: status,
      notes: notes,
    });

    // Step 9: Populate and return
   const result = await registration.populate([
    { path: "userId", select: "fullName email phone" },
    { path: "facilityId", select: "name street city" },
    { path: "bloodGroupId", select: "name" },
   ]);
    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "status",
        "notes",
        "qrCodeUrl",
        "code",
        "updatedAt",
        "expectedQuantity",
      ],
      object: result,
    });
  };

  // Lấy danh sách đăng ký hiến máu của người dùng
  getUserBloodDonationRegistrations = async (
    userId,
    { status, limit = 10, page = 1 }
  ) => {
    const query = { userId };
    if (status) query.status = status;

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select:
        "_id userId facilityId bloodGroupId preferredDate code status source notes location createdAt expectedQuantity",
      populate: [
        { path: "userId", select: "fullName email phone" },
        { path: "facilityId", select: "name street city address" },
        { path: "bloodGroupId", select: "name" },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };


  // Lấy chi tiết một đăng ký hiến máu
  getBloodDonationRegistrationDetail = async (registrationId, userId, role, staffId) => {
    let query = { _id: registrationId };
    
    // Nếu là Member (người dùng thông thường), chỉ được xem đăng ký của mình
    if (role === USER_ROLE.MEMBER) {
      query.userId = userId;
    }
    // Nếu là Staff (Nurse, Doctor, Manager), cần kiểm tra quyền truy cập
    else if ([USER_ROLE.NURSE, USER_ROLE.DOCTOR, USER_ROLE.MANAGER].includes(role)) {
      // Lấy thông tin staff để kiểm tra facilityId
      const staff = await facilityStaffModel.findById(staffId);
      
      if (!staff) {
        throw new BadRequestError("Không tìm thấy thông tin nhân viên");
      }
      
      // Staff chỉ được xem đăng ký thuộc facility của mình
      query.facilityId = staff.facilityId;
      
      // Nurse chỉ được xem đăng ký được gán cho mình hoặc chưa được gán
      if (role === USER_ROLE.NURSE) {
        query.$or = [
          { staffId: staffId },
          { staffId: { $exists: false } },
          { staffId: null }
        ];
      }
    }

    const registration = await bloodDonationRegistrationModel
      .findOne(query)
      .populate("userId", "fullName email phone avatar sex yob bloodId", null, { 
        populate: { path: "bloodId", select: "type name" }
      })
      .populate("facilityId", "name street city address contactPhone contactEmail")
      .populate("bloodGroupId", "name type")
      .populate("staffId", "userId position", null, {
        populate: { path: "userId", select: "fullName email phone" }
      })
      .lean();

    if (!registration) {
      throw new NotFoundError("Không tìm thấy đăng ký hoặc bạn không có quyền truy cập");
    }

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "staffId",
        "preferredDate",
        "status",
        "source",
        "notes",
        "code",
        "location",
        "expectedQuantity",
        "qrCodeUrl",
        "checkInAt",
        "completedAt",
        "createdAt",
        "updatedAt",
      ],
      object: registration,
    });
  };

  /** BLOOD DONATION */
  // Lấy lịch sử hiến máu của user
  getUserDonations = async (userId, limit = 10, page = 1) => {
    const result = await getPaginatedData({
      model: bloodDonationModel,
      query: { userId },
      page,
      limit,
      select:
        "_id userId bloodGroupId quantity donationDate status bloodDonationRegistrationId createdAt",
      populate: [
        { path: "bloodGroupId", select: "name" },
        {
          path: "bloodDonationRegistrationId",
          select: "preferredDate facilityId",
          populate: { path: "facilityId", select: "name street city" },
        },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Tạo bản ghi hiến máu
  createBloodDonation = async ({
    userId,
    staffId,
    bloodGroupId,
    bloodDonationRegistrationId,
    healthCheckId,
  }) => {

    // Kiểm tra required fields
    if (!userId) throw new BadRequestError("User ID is required");
    if (!staffId) throw new BadRequestError("Staff ID is required");
    if (!bloodGroupId) throw new BadRequestError("Blood group ID is required");
    if (!bloodDonationRegistrationId) throw new BadRequestError("Blood donation registration ID is required");
    if (!healthCheckId) throw new BadRequestError("Health check ID is required");
    
    // Kiểm tra user và registration
    const [user, registration, healthCheck] = await Promise.all([
      userModel.findOne({ _id: userId }),
      bloodDonationRegistrationModel.findOne({ _id: bloodDonationRegistrationId }).populate("facilityId", "name"),
      healthCheckModel.findOne({ _id: healthCheckId })
    ]);
    
    if (!user) throw new NotFoundError("User not found");
    if (!registration) {
      throw new NotFoundError("Registration not found");
    }
    if (!healthCheck) throw new NotFoundError("Health check not found");

    const donation = await bloodDonationModel.create({
      userId,
      staffId,
      bloodGroupId,
      bloodDonationRegistrationId,
      donationDate: new Date(),
      status: BLOOD_DONATION_STATUS.DONATING,
      healthCheckId,
      doctorId: healthCheck.doctorId,
    });

    // Update registration status
    registration.status = BLOOD_DONATION_REGISTRATION_STATUS.DONATING;
    await registration.save();

    // Update process donation log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId,
      changedBy: staffId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
      notes: "Đang hiến máu",
    });

    // Send notification to user
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      userId,
      BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
      registration.facilityId.name,
      registration._id
    );

    // Populate and return
    const result = await populateExistingDocument({
      document: donation,
      nestedPopulate: [
        createNestedPopulateConfig("bloodGroupId", "name" ),
        createNestedPopulateConfig("bloodDonationRegistrationId", "facilityId preferredDate", {
          path: "facilityId",
          select: "name street city"
        }),
        createNestedPopulateConfig("staffId", "userId position", {
          path: "userId",
          select: "fullName"
        }),
        createNestedPopulateConfig("userId", "fullName email phone"),
        createNestedPopulateConfig("doctorId", "userId position", {
          path: "userId",
          select: "fullName"
        })
      ]
    });

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "staffId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "donationDate",
        "status",
        "doctorId",
        "healthCheckId",
      ],
      object: result,
    });
  };

  // Lấy danh sách hiến máu
  getBloodDonations = async ({ status, facilityId, limit = 10, page = 1 }) => {
    const query = {};
    if (status) query.status = status;

    const result = await getPaginatedData({
      model: bloodDonationModel,
      query,
      page,
      limit,
      select:
        "_id userId bloodGroupId quantity donationDate status bloodDonationRegistrationId createdAt",
      populate: [
        { path: "userId", select: "fullName email phone avatar" },
        { path: "bloodGroupId", select: "name" },
        {path: "staffId", select: "userId position",
          populate: { path: "userId", select: "fullName" }
        },
        {
          path: "bloodDonationRegistrationId",
          select: "facilityId preferredDate",
          populate: { path: "facilityId", select: "name street city" },
        },
      ],
      sort: { createdAt: -1 },
    });

    // Lọc theo facilityId nếu có
    if (facilityId) {
      result.data = result.data.filter(
        (donation) =>
          donation.bloodDonationRegistrationId?.facilityId?._id.toString() ===
          facilityId.toString()
      );
    }

    return result;
  };

  // Lấy chi tiết một bản ghi hiến máu
  getBloodDonationDetail = async (donationId, userId, role) => {
    const query =
      role === USER_ROLE.NURSE ||
      role === USER_ROLE.MANAGER ||
      role === USER_ROLE.DOCTOR
        ? { _id: donationId }
        : { _id: donationId, userId };
    const donation = await bloodDonationModel
      .findOne(query)
      .populate("userId", "fullName email phone sex yob avatar")
      .populate("bloodGroupId", "name")
      .populate({
        path: "staffId",
        select: "userId position",
        populate: { path: "userId", select: "fullName" }
      })
      .populate({
        path: "bloodDonationRegistrationId",
        select: "preferredDate facilityId code",
        populate: { path: "facilityId", select: "name street city location" },
      })
      .lean();

    if (!donation) throw new NotFoundError("Không tìm thấy bản ghi hiến máu");

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "staffId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "quantity",
        "donationDate",
        "status",
        "createdAt",
        "code",
        "updatedAt",
        "notes",
        "isDivided"
      ],
      object: donation,
    });
  };

  /** STAFF AND MANAGER APIs */
  
  // Lấy danh sách đăng ký hiến máu được gán cho staff (cho nurse)
  getStaffAssignedRegistrations = async ({
    staffId,
    status,
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    bloodGroupId
  }) => {
    let query = { staffId };
    
    // Filter by status
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }
    
    // Filter by blood group
    if (bloodGroupId) {
      query.bloodGroupId = bloodGroupId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select: "_id userId facilityId bloodGroupId staffId preferredDate code status notes expectedQuantity createdAt checkedInAt",
      populate: [
        { path: "userId", select: "fullName email phone bloodId avatar", 
          populate: { path: "bloodId", select: "name" }
        },
        { path: "facilityId", select: "name street city" },
        { path: "bloodGroupId", select: "name" },
        { path: "staffId", select: "userId position",
          populate: { path: "userId", select: "fullName" }
        }
      ],
      search,
      searchFields: ["notes"],
      sort: { preferredDate: -1 },
    });

    return result;
  };

  // Lấy danh sách đăng ký hiến máu của facility (cho manager)
  getFacilityRegistrations = async ({
    facilityId,
    status,
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    bloodGroupId,
    staffId,
    includeStats = false
  }) => {
    let query = { facilityId };
    
    // Filter by status
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }
    
    // Filter by blood group
    if (bloodGroupId) {
      query.bloodGroupId = bloodGroupId;
    }
    
    // Filter by staff
    if (staffId) {
      query.staffId = staffId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const result = await getPaginatedData({
      model: bloodDonationRegistrationModel,
      query,
      page,
      limit,
      select: "_id userId facilityId bloodGroupId staffId preferredDate code status notes expectedQuantity createdAt checkedInAt completedAt qrCodeUrl",
      populate: [
        { path: "userId", select: "fullName email phone bloodId", 
          populate: { path: "bloodId", select: "type" }
        },
        { path: "facilityId", select: "name street city" },
        { path: "bloodGroupId", select: "name" },
        { path: "staffId", select: "userId position",
          populate: { path: "userId", select: "fullName" }
        }
      ],
      search,
      searchFields: ["notes"],
      sort: { createdAt: -1 },
    });

    // Include statistics if requested
    if (includeStats) {
      const stats = await this.getRegistrationStatistics({
        facilityId,
        startDate,
        endDate,
        groupBy: 'status'
      });
      result.statistics = stats;
    }

    return result;
  };

  // Lấy thống kê đăng ký hiến máu
  getRegistrationStatistics = async ({
    facilityId,
    startDate,
    endDate,
    groupBy = 'day'
  }) => {
    let matchQuery = { facilityId };
    
    // Date range filter
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy === 'status' ? '$status' : {
            $dateToString: {
              format: groupBy === 'day' ? '%Y-%m-%d' : 
                     groupBy === 'week' ? '%Y-W%U' : '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          totalExpectedQuantity: { $sum: '$expectedQuantity' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    // Status distribution
    const statusStats = await bloodDonationRegistrationModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Blood type distribution
    const bloodTypeStats = await bloodDonationRegistrationModel.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'bloodgroups',
          localField: 'bloodGroupId',
          foreignField: '_id',
          as: 'bloodGroup'
        }
      },
      { $unwind: '$bloodGroup' },
      {
        $group: {
          _id: '$bloodGroup.type',
          count: { $sum: 1 }
        }
      }
    ]);

    const timeSeriesStats = await bloodDonationRegistrationModel.aggregate(pipeline);

    return {
      statusDistribution: statusStats,
      bloodTypeDistribution: bloodTypeStats,
      timeSeries: timeSeriesStats,
      summary: {
        total: statusStats.reduce((sum, stat) => sum + stat.count, 0),
        pending: statusStats.find(s => s._id === BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL)?.count || 0,
        registered: statusStats.find(s => s._id === BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED)?.count || 0,
        completed: statusStats.find(s => s._id === BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED)?.count || 0,
      }
    };
  };

  // Xử lý check-in qua QR code
  processCheckIn = async ({ qrData, staffId, checkedBy }) => {
    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      throw new BadRequestError("QR code data không hợp lệ");
    }
    
    const { registrationId } = parsedData;
    if (!registrationId) {
      throw new BadRequestError("QR code không chứa thông tin registration ID");
    }

    // Find and validate registration
    const registration = await bloodDonationRegistrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundError("Không tìm thấy đăng ký hiến máu");
    }

    // Check if already checked in
    if (registration.status !== BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED) {
      throw new BadRequestError("Đăng ký này đã được check-in hoặc không ở trạng thái cho phép check-in");
    }

    // Update registration status
    registration.status = BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN;
    registration.checkInAt = new Date();
    registration.staffId = staffId;
    
    await registration.save();

    // Notify user
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      registration.userId,
      BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN,
      registration.facilityId.name,
      registration._id
    );

    // Create process log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: registration.userId,
      changedBy: staffId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN,
      notes: "Check-in thành công qua QR code",
    });

    // Populate result
    const result = await registration.populate([
      { path: "userId", select: "fullName email phone" },
      { path: "facilityId", select: "name street city" },
      { path: "bloodGroupId", select: "name" }
    ]);

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "status",
        "checkInAt",
        "preferredDate",
        "expectedQuantity"
      ],
      object: result,
    });
  };

  // Cập nhật bản ghi hiến máu (cho luồng hiến máu)
  updateBloodDonation = async ({
    donationId,
    staffId,
    quantity,
    status,
    notes
  }) => {
    // Tìm bản ghi hiến máu
    const donation = await bloodDonationModel.findById(donationId);
    if (!donation) {
      throw new NotFoundError("Không tìm thấy bản ghi hiến máu");
    }

    if (status && status === donation.status) {
      throw new BadRequestError("Trạng thái hiến máu hiện tại đã được cập nhật");
    }
    if (status === BLOOD_DONATION_STATUS.COMPLETED && !quantity) {
      throw new BadRequestError("Vui lòng nhập số lượng hiến máu");
    }
    if (!notes && status === BLOOD_DONATION_STATUS.CANCELLED) {
      throw new BadRequestError("Vui lòng nhập lý do huỷ hiến máu");
    }
    if (!quantity && status === BLOOD_DONATION_STATUS.COMPLETED) {
      throw new BadRequestError("Vui lòng nhập số lượng hiến máu");
    }
    const healthCheck = await healthCheckModel.findOne({
      _id: donation.healthCheckId,
    });

    if (status === BLOOD_DONATION_STATUS.COMPLETED && quantity) {
      donation.quantity = quantity;
      donation.status = BLOOD_DONATION_STATUS.COMPLETED;
      if (healthCheck) {
        healthCheck.status = HEALTH_CHECK_STATUS.DONATED;
        await healthCheck.save();
      }

    } else if (status === BLOOD_DONATION_STATUS.CANCELLED) {
      donation.status = BLOOD_DONATION_STATUS.CANCELLED;
      if (healthCheck) {
        healthCheck.status = HEALTH_CHECK_STATUS.DONATED;
        await healthCheck.save();
      }
    } 
    if (notes) {
      donation.notes = notes;
    }

    await donation.save();

    // Nếu có registration ID, cập nhật trạng thái registration tương ứng
    if (donation.bloodDonationRegistrationId) {
      const registration = await bloodDonationRegistrationModel.findById(
        donation.bloodDonationRegistrationId
      ).populate("facilityId", "name");
      
      if (registration) {
        // Logic chuyển trạng thái registration dựa vào donation status
        if (donation.status === BLOOD_DONATION_STATUS.COMPLETED && donation.quantity) {
          registration.status = BLOOD_DONATION_REGISTRATION_STATUS.DONATED;
          // Tạo log
          await processDonationLogService.createProcessDonationLog({
            registrationId: registration._id,
            userId: registration.userId,
            changedBy: staffId,
            status: BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
            notes: "Hiến máu thành công",
          });

          // Tạo bản ghi trạng thái người hiến
          await donorStatusLogService.createDonorStatusLog({
            donationId: donation._id,
            userId: registration.userId,
            staffId: staffId,
          });

        } else if (donation.status === BLOOD_DONATION_STATUS.CANCELLED) {
          // Khi huỷ hiến máu
          registration.status = BLOOD_DONATION_REGISTRATION_STATUS.CANCELLED;
          
          // Tạo log
          await processDonationLogService.createProcessDonationLog({
            registrationId: registration._id,
            userId: registration.userId,
            changedBy: staffId,
            status: BLOOD_DONATION_REGISTRATION_STATUS.CANCELLED,
            notes: "Huỷ hiến máu",
          });
        }
        
        await registration.save();

        // Gửi thông báo cho user
        await notificationService.sendBloodDonationRegistrationStatusNotification(
          registration.userId,
          registration.status,
          registration.facilityId.name,
          registration._id
        );
      }
    }

    // Populate result
    const result = await donation.populate([
      { path: "userId", select: "fullName email phone" },
      { path: "bloodGroupId", select: "name" },
      { 
        path: "bloodDonationRegistrationId", 
        select: "preferredDate facilityId status",
        populate: { path: "facilityId", select: "name street city" }
      }
    ]);

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "staffId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "quantity",
        "donationDate",
        "donationStartAt",
        "status",
        "code",
        "notes",
        "updatedAt"
      ],
      object: result,
    });
  };

  // Chuyển registration từ DONATED sang RESTING
  transitionToResting = async ({
    registrationId,
    staffId,
    notes
  }) => {
    const registration = await bloodDonationRegistrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundError("Không tìm thấy đăng ký hiến máu");
    }

    // Kiểm tra trạng thái hiện tại
    if (registration.status !== BLOOD_DONATION_REGISTRATION_STATUS.DONATED) {
      throw new BadRequestError("Chỉ có thể chuyển sang nghỉ ngơi từ trạng thái đã hiến máu");
    }

    // Cập nhật trạng thái
    registration.status = BLOOD_DONATION_REGISTRATION_STATUS.RESTING;
    await registration.save();

    // Tạo log
    await processDonationLogService.createProcessDonationLog({
      registrationId: registration._id,
      userId: registration.userId,
      changedBy: staffId,
      status: BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
      notes: notes || "Chuyển sang giai đoạn nghỉ ngơi",
    });

    // Gửi thông báo
    await notificationService.sendBloodDonationRegistrationStatusNotification(
      registration.userId,
      BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
      registration.facilityId?.name || "Facility",
      registration._id
    );

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "facilityId",
        "bloodGroupId",
        "status",
        "notes",  
        "code",
        "updatedAt"
      ],
      object: registration,
    });
  };

  // Lấy danh sách blood donation theo doctorId (sử dụng staffId từ token)
  getBloodDonationsByDoctorId = async ({
    doctorId,
    status,
    isDivided,
    limit = 10,
    page = 1,
  }) => {
    const query = { doctorId };
    
    if (status) {
      query.status = status;
    }
    
    // Filter by isDivided if provided
    if (isDivided !== undefined) {
      query.isDivided = isDivided === 'true' || isDivided === true;
    }

    const result = await getPaginatedData({
      model: bloodDonationModel,
      query,
      page,
      limit,
      select: "_id userId bloodGroupId quantity donationDate status isDivided bloodDonationRegistrationId createdAt updatedAt code",
      populate: [
        { path: "userId", select: "fullName email phone avatar" },
        { path: "bloodGroupId", select: "name type" },
        { path: "staffId", select: "userId position",
          populate: { path: "userId", select: "fullName" }
        },
        { path: "doctorId", select: "userId position",
          populate: { path: "userId", select: "fullName" }
        },
        {
          path: "bloodDonationRegistrationId",
          select: "facilityId preferredDate code",
          populate: { path: "facilityId", select: "name street city" },
        },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Mark blood donation as divided (Doctor only)
  markBloodDonationAsDivided = async ({ donationId, doctorId }) => {
    // Find the blood donation
    const donation = await bloodDonationModel.findOne({
      _id: donationId,
      doctorId: doctorId, 
    });

    if (!donation) {
      throw new NotFoundError("Không tìm thấy blood donation hoặc bạn không có quyền cập nhật");
    }

    // Check if donation is completed
    if (donation.status !== BLOOD_DONATION_STATUS.COMPLETED) {
      throw new BadRequestError("Chỉ có thể đánh dấu đã phân chia cho donation đã hoàn thành");
    }

    // Update isDivided to true
    donation.isDivided = true;
    await donation.save();

    // Populate and return
    const result = await donation.populate([
      { path: "userId", select: "fullName email phone" },
      { path: "bloodGroupId", select: "name" },
      { path: "doctorId", select: "userId position",
        populate: { path: "userId", select: "fullName email phone" }
      },
      {
        path: "bloodDonationRegistrationId",
        select: "facilityId preferredDate code",
        populate: { path: "facilityId", select: "name street city" },
      },
      {
        path: "staffId",
        select: "userId position",
        populate: { path: "userId", select: "fullName email phone" }
      }
    ]);

    return getInfoData({
      fields: [
        "_id",
        "userId",
        "bloodGroupId",
        "bloodDonationRegistrationId",
        "quantity",
        "donationDate",
        "status",
        "isDivided",
        "doctorId",
        "updatedAt"
      ],
      object: result,
    });
  };
}

module.exports = new BloodDonationService();
