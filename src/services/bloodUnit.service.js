"use strict";

const bloodUnitModel = require("../models/bloodUnit.model");
const bloodDonationModel = require("../models/bloodDonation.model");
const bloodInventoryService = require("./bloodInventory.service");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const { BLOOD_COMPONENT, BLOOD_DONATION_STATUS, BLOOD_UNIT_STATUS } = require("../constants/enum");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const bloodComponentModel = require("../models/bloodComponent.model");

class BloodUnitService {
  // Tạo blood units từ blood donation (Doctor)
  createBloodUnitsFromDonation = async ({
    donationId,
    staffId,
    units 
  }) => {
    console.log("🚀 ~ BloodUnitService ~ units:", units)
    // Kiểm tra donation
    const donation = await bloodDonationModel
      .findById(donationId)
      .populate("bloodDonationRegistrationId")
      .populate("bloodGroupId");

    if (!donation) {
      throw new NotFoundError("Không tìm thấy bản ghi hiến máu");
    }

    if (donation.status !== BLOOD_DONATION_STATUS.COMPLETED) {
      throw new BadRequestError(
        "Chỉ có thể tạo blood units từ donation đã hoàn thành"
      );
    }

    // Kiểm tra units input
    if (!units || !Array.isArray(units) || units.length === 0) {
      throw new BadRequestError("Danh sách units không hợp lệ");
    }

    const facilityId = donation.bloodDonationRegistrationId.facilityId;
    const bloodGroupId = donation.bloodGroupId._id;
    const collectedAt = donation.donationDate;

    const createdUnits = [];

    for (const unitData of units) {
      const { componentId, quantity } = unitData;

      // Validate componentId
      if (!componentId) {
        throw new BadRequestError("Thành phần máu không hợp lệ (componentId thiếu)");
      }
      const componentDoc = await bloodComponentModel.findById(componentId);
      if (!componentDoc) {
        throw new BadRequestError(`Không tìm thấy thành phần máu với id: ${componentId}`);
      }
      const component = componentDoc.name;

      if (!quantity || quantity <= 0) {
        throw new BadRequestError(`Khối lượng không hợp lệ cho ${component}`);
      }

      // Tính ngày hết hạn dựa trên component
      const expiresAt = this.calculateExpiryDate(collectedAt, component);

      const bloodUnit = await bloodUnitModel.create({
        donationId,
        facilityId,
        bloodGroupId,
        componentId,
        quantity,
        remainingQuantity: quantity,
        collectedAt,
        expiresAt,
        processedBy: staffId,
        processedAt: new Date(),
        status: BLOOD_UNIT_STATUS.TESTING
      });

      createdUnits.push(bloodUnit);
    }

    return createdUnits.map(unit => getInfoData({
      fields: [
        "_id",
        "donationId",
        "facilityId", 
        "bloodGroupId",
        "componentId",
        "quantity",
        "collectedAt",
        "expiresAt",
        "status",
        "processedAt",
        "createdAt"
      ],
      object: unit,
    }));
  };

  // Cập nhật kết quả test và approve blood unit
  updateBloodUnit = async ({
    unitId,
    staffId,
    testResults,
    status,
    notes,
    quantity,
    expiresAt
  }) => {
    const bloodUnit = await bloodUnitModel.findById(unitId);
    if (!bloodUnit) {
      throw new NotFoundError("Không tìm thấy blood unit");
    }

    // Cập nhật test results
    if (testResults) {
      bloodUnit.testResults = { ...bloodUnit.testResults, ...testResults };
    }

    // Cập nhật status
    if (status) {
      bloodUnit.status = status;
      if (status === BLOOD_UNIT_STATUS.AVAILABLE) {
        bloodUnit.approvedBy = staffId;
        bloodUnit.approvedAt = new Date();
        // Cập nhật inventory khi approve
        await this.updateInventoryFromUnit(bloodUnit);
      }
    }

    if (notes) {
      bloodUnit.testResults.notes = notes;
    }

    if (quantity) {
      bloodUnit.quantity = quantity;
    }

    if (expiresAt) {
      bloodUnit.expiresAt = expiresAt;
    }

    await bloodUnit.save();

    const result = await bloodUnit.populate([
      { path: "facilityId", select: "name code" },
      { path: "bloodGroupId", select: "name type" },
      { path: "donationId", select: "userId donationDate" },
      {
        path: "processedBy",
        select: "userId position",
        populate: { path: "userId", select: "fullName" },
      },
      {
        path: "approvedBy",
        select: "userId position",
        populate: { path: "userId", select: "fullName" },
      },
    ]);

    return getInfoData({
      fields: [
        "_id",
        "donationId",
        "facilityId",
        "bloodGroupId", 
        "componentId",
        "quantity",
        "collectedAt",
        "expiresAt",
        "status",
        "testResults",
        "processedBy",
        "processedAt",
        "approvedBy",
        "approvedAt",
        "updatedAt",
      ],
      object: result,
    });
  };

  // Lấy blood units theo donation
  getBloodUnitsByDonation = async (donationId, { page = 1, limit = 10 }) => {
    const result = await getPaginatedData({
      model: bloodUnitModel,
      query: { donationId },
      page,
      limit,
      select: "_id donationId facilityId bloodGroupId componentId quantity collectedAt expiresAt status testResults processedAt approvedAt createdAt",
      populate: [
        { path: "facilityId", select: "name code" },
        { path: "bloodGroupId", select: "name type" },
        {
          path: "processedBy",
          select: "userId position",
          populate: { path: "userId", select: "fullName" },
        },
        {
          path: "approvedBy",
          select: "userId position",
          populate: { path: "userId", select: "fullName" },
        },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Lấy blood units theo facility
  getBloodUnitsByFacility = async (
    facilityId,
    {
      status,
      componentId,
      bloodGroupId,
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
    }
  ) => {
    const query = { facilityId };

    if (status) query.status = status;
    if (componentId) query.componentId = componentId;
    if (bloodGroupId) query.bloodGroupId = bloodGroupId;

    if (startDate || endDate) {
      query.collectedAt = {};
      if (startDate) query.collectedAt.$gte = new Date(startDate);
      if (endDate) query.collectedAt.$lte = new Date(endDate);
    }
    const result = await getPaginatedData({
      model: bloodUnitModel,
      query,
      page,
      limit,
      select: "_id donationId remainingQuantity facilityId bloodGroupId componentId quantity collectedAt expiresAt status testResults processedAt approvedAt createdAt",
      populate: [
        { path: "bloodGroupId", select: "name type" },
        { path: "componentId", select: "name" },
        {
          path: "donationId",
          select: "userId donationDate",
          populate: { path: "userId", select: "fullName" },
        },
        {
          path: "processedBy",
          select: "userId position",
          populate: { path: "userId", select: "fullName" },
        },
        {
          path: "approvedBy",
          select: "userId position",
          populate: { path: "userId", select: "fullName" },
        },
      ],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Lấy blood units do doctor hiện tại xử lý
  getBloodUnitsByProcessedBy = async (staffId, { 
    status, 
    component, 
    page = 1, 
    limit = 10,
    search,
    startDate,
    endDate
  }) => {
    const query = { processedBy: staffId };
    
    if (status) query.status = status;
    if (component) query.component = component;
    
    if (startDate || endDate) {
      query.collectedAt = {};
      if (startDate) query.collectedAt.$gte = new Date(startDate);
      if (endDate) query.collectedAt.$lte = new Date(endDate);
    }

    const result = await getPaginatedData({
      model: bloodUnitModel,
      query,
      page,
      limit,
      select: "_id code donationId facilityId bloodGroupId componentId quantity collectedAt expiresAt status testResults processedBy processedAt approvedBy approvedAt createdAt updatedAt",
      populate: [
        { path: "bloodGroupId", select: "name type" },
        { 
          path: "donationId", 
          select: "userId donationDate quantity", 
          populate: { path: "userId", select: "fullName email phone" } 
        },
        { 
          path: "processedBy", 
          select: "userId position", 
          populate: { path: "userId", select: "fullName" } 
        },
        { 
          path: "approvedBy", 
          select: "userId position", 
          populate: { path: "userId", select: "fullName" } 
        }
      ],
      search,
      searchFields: ["code", "donationId.userId.fullName", "donationId.userId.email", "donationId.userId.phone"],
      sort: { createdAt: -1 },
    });

    return result;
  };

  // Lấy chi tiết blood unit
  getBloodUnitDetail = async (unitId) => {
    const bloodUnit = await bloodUnitModel
      .findById(unitId)
      .populate("facilityId", "name code address")
      .populate("bloodGroupId", "name type")
      .populate("componentId", "name")
      .populate({
        path: "donationId",
        select: "userId donationDate quantity",
        populate: { path: "userId", select: "fullName email phone" },
      })
      .populate({
        path: "processedBy",
        select: "userId position",
        populate: { path: "userId", select: "fullName email" },
      })
      .populate({
        path: "approvedBy",
        select: "userId position",
        populate: { path: "userId", select: "fullName email" },
      })
      .lean();

    if (!bloodUnit) {
      throw new NotFoundError("Không tìm thấy blood unit");
    }

    return getInfoData({
      fields: [
        "_id",
        "donationId",
        "facilityId",
        "bloodGroupId",
        "componentId", 
        "quantity",
        "collectedAt",
        "expiresAt",
        "status",
        "testResults",
        "processedBy",
        "processedAt",
        "approvedBy",
        "approvedAt",
        "createdAt",
        "updatedAt",
        "code"
      ],
      object: bloodUnit,
    });
  };

  // Helper: Tính ngày hết hạn
  calculateExpiryDate = (collectedAt, component) => {
    const collected = new Date(collectedAt);
    let daysToAdd;

    switch (component) {
      case BLOOD_COMPONENT.WHOLE:
        daysToAdd = 35; // Máu toàn phần: 35 ngày
        break;
      case BLOOD_COMPONENT.RED_CELLS:
        daysToAdd = 42; // Hồng cầu: 42 ngày
        break;
      case BLOOD_COMPONENT.PLASMA:
        daysToAdd = 365; // Huyết tương: 1 năm
        break;
      case BLOOD_COMPONENT.PLATELETS:
        daysToAdd = 5; // Tiểu cầu: 5 ngày
        break;
      default:
        daysToAdd = 35;
    }

    const expiryDate = new Date(collected);
    expiryDate.setDate(expiryDate.getDate() + daysToAdd);
    return expiryDate;
  };

  // Helper method: Cập nhật inventory khi blood unit được approve
  updateInventoryFromUnit = async (bloodUnit) => {
    await bloodInventoryService.updateInventoryFromUnit(bloodUnit);
  };

  // Thống kê blood units
  getBloodUnitsStatistics = async (facilityId, { startDate, endDate } = {}) => {
    const matchQuery = { facilityId };

    if (startDate || endDate) {
      matchQuery.collectedAt = {};
      if (startDate) matchQuery.collectedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.collectedAt.$lte = new Date(endDate);
    }

    const [statusStats, componentStats, expiryStats] = await Promise.all([
      // Thống kê theo status
      bloodUnitModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]),

      // Thống kê theo component
      bloodUnitModel.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$componentId", count: { $sum: 1 }, totalQuantity: { $sum: "$quantity" } } }
      ]),

      // Units sắp hết hạn (trong 7 ngày)
      bloodUnitModel.countDocuments({
        ...matchQuery,
        status: "available",
        expiresAt: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      statusDistribution: statusStats,
      componentDistribution: componentStats,
      expiringUnits: expiryStats,
      summary: {
        total: statusStats.reduce((sum, stat) => sum + stat.count, 0),
        available: statusStats.find((s) => s._id === "available")?.count || 0,
        testing: statusStats.find((s) => s._id === "testing")?.count || 0,
        rejected: statusStats.find((s) => s._id === "rejected")?.count || 0,
      },
    };
  };
}

module.exports = new BloodUnitService();
