"use strict";

const { getInfoData } = require("../utils");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");
const processDonationLogModel = require("../models/processDonationLog.model");
const { 
  getNestedPopulatedData, 
  populateExistingDocument, 
  createNestedPopulateConfig 
} = require("../helpers/mongooseHelper");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const { default: mongoose } = require("mongoose");
const { DONATION_PROCESS_LOG_MESSAGE } = require("../constants/message");

class ProcessDonationLogService {
  createProcessDonationLog = async ({
    registrationId,
    userId,
    changedBy = null,
    status,
    notes,  
  }) => {
    if (!registrationId || !mongoose.Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestError(
        DONATION_PROCESS_LOG_MESSAGE.REGISTRATION_ID_REQUIRED_OR_INVALID
      );
    }

    const registration = await bloodDonationRegistrationModel.findById(registrationId);
    if (!registration) {
      throw new BadRequestError(DONATION_PROCESS_LOG_MESSAGE.REGISTRATION_NOT_FOUND);
    }

    if (!status || !Object.values(BLOOD_DONATION_REGISTRATION_STATUS).includes(status)) {
      throw new BadRequestError(DONATION_PROCESS_LOG_MESSAGE.STATUS_REQUIRED_OR_INVALID);
    }

    if(status !== BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL && !changedBy) {
      throw new BadRequestError(DONATION_PROCESS_LOG_MESSAGE.CHANGED_BY_REQUIRED_OR_INVALID);
    }
    if(changedBy && !mongoose.Types.ObjectId.isValid(changedBy)) {
      throw new BadRequestError(DONATION_PROCESS_LOG_MESSAGE.CHANGED_BY_REQUIRED_OR_INVALID);
    }

    if (notes && typeof notes !== "string") {
      throw new BadRequestError("Notes must be a string");
    }

    const processDonationLog = await processDonationLogModel.create({
      registrationId,
      userId,
      changedBy,
      status,
      notes,
      changedAt: new Date(),
    });

    const populatedLog = await populateExistingDocument({
      document: processDonationLog,
      nestedPopulate: [
        createNestedPopulateConfig(
          "changedBy",
          "_id userId position",
          {
            path: "userId",
            select: "_id fullName email phone avatar"
          }
        )
      ]
    });

    return getInfoData({
      fields: ["_id", "registrationId", "userId", "changedBy", "status", "notes", "changedAt"],
      object: populatedLog,
    });
  };

  /**
   * Lấy danh sách donation logs với nested populate
   */
  getProcessDonationLogs = async ({
    query = {},
    page = 1,
    limit = 10,
    isPaginated = true,
    search = "",
    searchFields = ["notes"]
  }) => {
    const nestedPopulate = [
      createNestedPopulateConfig(
        "changedBy",
        "_id userId position",
        {
          path: "userId",
          select: "_id fullName email phone avatar"
        }
      ),
      createNestedPopulateConfig(
        "registrationId",
        "_id userId preferredDate status",
        {
          path: "userId",
          select: "_id fullName phone bloodId"
        }
      )
    ];

    return await getNestedPopulatedData({
      model: processDonationLogModel,
      query,
      select: "_id registrationId status changedBy notes changedAt createdAt",
      nestedPopulate,
      sort: { changedAt: -1 },
      page,
      limit,
      isPaginated,
      search,
      searchFields
    });
  };

  /**
   * Lấy donation logs theo registration ID
   */
  getLogsByRegistrationId = async (registrationId) => {
    if (!registrationId) {
      throw new BadRequestError("Registration ID is required");
    }

    const nestedPopulate = [
      createNestedPopulateConfig(
        "changedBy",
        "_id userId position",
        {
          path: "userId",
          select: "_id fullName email phone avatar"
        }
      )
    ];

    const result = await getNestedPopulatedData({
      model: processDonationLogModel,
      query: { registrationId },
      select: "_id registrationId status changedBy notes changedAt",
      nestedPopulate,
      sort: { changedAt: 1 }, // Sắp xếp theo thời gian tăng dần để thấy timeline
      isPaginated: false
    });

    return result.data;
  };

  /**
   * Lấy log detail theo ID
   */
  getLogById = async (logId) => {
    if (!logId) {
      throw new BadRequestError("Log ID is required");
    }

    const nestedPopulate = [
      createNestedPopulateConfig(
        "changedBy",
        "_id userId position facilityId",
        {
          path: "userId",
          select: "_id fullName email phone avatar"
        }
      ),
      createNestedPopulateConfig(
        "registrationId",
        "_id userId preferredDate status facilityId",
        {
          path: "userId",
          select: "_id fullName phone bloodId email"
        }
      )
    ];

    const result = await getNestedPopulatedData({
      model: processDonationLogModel,
      query: { _id: logId },
      select: "_id registrationId status changedBy notes changedAt createdAt",
      nestedPopulate,
      isPaginated: false
    });

    if (!result.data || result.data.length === 0) {
      throw new BadRequestError("Process donation log not found");
    }

    return result.data[0];
  };

  /**
   * Lấy logs theo facility staff
   */
  getLogsByStaff = async (staffId, { page = 1, limit = 10, isPaginated = true } = {}) => {
    if (!staffId) {
      throw new BadRequestError("Staff ID is required");
    }

    const nestedPopulate = [
      createNestedPopulateConfig(
        "changedBy",
        "_id userId position",
        {
          path: "userId",
          select: "_id fullName email phone avatar"
        }
      ),
      createNestedPopulateConfig(
        "registrationId",
        "_id userId preferredDate status",
        {
          path: "userId",
          select: "_id fullName phone bloodId"
        }
      )
    ];

    return await getNestedPopulatedData({
      model: processDonationLogModel,
      query: { changedBy: staffId },
      select: "_id registrationId status changedBy notes changedAt",
      nestedPopulate,
      sort: { changedAt: -1 },
      page,
      limit,
      isPaginated
    });
  };
}

module.exports = new ProcessDonationLogService();
