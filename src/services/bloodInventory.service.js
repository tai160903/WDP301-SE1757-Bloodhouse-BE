"use strict";

const bloodInventoryModel = require("../models/bloodInventory.model");
const bloodUnitModel = require("../models/bloodUnit.model");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const bloodComponentModel = require("../models/bloodComponent.model");

class BloodInventoryService {
  // Existing methods for backward compatibility
  createBloodInventory = async (data) => {
    const bloodInventory = await bloodInventoryModel.create(data);
    return bloodInventory;
  };

  getBloodInventory = async () => {
    const bloodInventories = await bloodInventoryModel
      .find()
      .populate("facilityId", "name code address")
      .populate("componentId", "name")
      .populate("groupId", "name type");
    return bloodInventories;
  };

  getBloodInventoryByFacilityId = async (facilityId) => {
    const bloodInventories = await bloodInventoryModel
      .find({ facilityId })
      .populate("facilityId", "name code address")
      .populate("componentId", "name")
      .populate("groupId", "name type");
    return bloodInventories;
  };

  getBloodInventoryByFacilityIdAvailable = async (facilityId, query) => {
    const { componentId, groupId } = query;
    const filter = { facilityId, totalQuantity: { $gt: 0 } };
    
    if (componentId) filter.componentId = componentId;
    if (groupId) filter.groupId = groupId;

    const bloodInventories = await bloodInventoryModel
      .find(filter)
      .populate("facilityId", "name code address")
      .populate("componentId", "name")
      .populate("groupId", "name type");
    return bloodInventories;
  };

  // New enhanced methods based on API specification

  // Lấy inventory theo facility với pagination và unit stats
  getInventoryByFacility = async (facilityId, { 
    componentId, 
    groupId,
    page = 1, 
    limit = 10 
  }) => {
    const query = { facilityId };
    
    if (componentId) query.componentId = componentId;
    if (groupId) query.groupId = groupId;

    const result = await getPaginatedData({
      model: bloodInventoryModel,
      query,
      page,
      limit,
      select: "_id facilityId componentId groupId totalQuantity createdAt updatedAt",
      populate: [
        { path: "facilityId", select: "name code address" },
        { path: "componentId", select: "name description" },
        { path: "groupId", select: "name type" }
      ],
      sort: { updatedAt: -1 },
    });

    // Thêm thông tin chi tiết về units cho mỗi inventory item
    for (let item of result.data) {
      const unitStats = await bloodUnitModel.aggregate([
        {
          $match: {
            facilityId: item.facilityId._id,
            bloodGroupId: item.groupId._id,
            component: item.componentId.name,
            status: { $in: ["available", "reserved", "expired", "testing", "rejected"] }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]);

      item.unitStats = unitStats;
    }

    return result;
  };

  // Lấy chi tiết inventory với unit statistics và expiring units
  getInventoryDetail = async (inventoryId) => {
    const inventory = await bloodInventoryModel
      .findById(inventoryId)
      .populate("facilityId", "name code address")
      .populate("componentId", "name description")
      .populate("groupId", "name type")
      .lean();

    if (!inventory) {
      throw new NotFoundError("Không tìm thấy bản ghi inventory");
    }

    // Lấy thống kê units liên quan
    const unitStats = await bloodUnitModel.aggregate([
      {
        $match: {
          facilityId: inventory.facilityId._id,
          bloodGroupId: inventory.groupId._id,
          component: inventory.componentId.name
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);

    // Lấy units sắp hết hạn (trong 7 ngày)
    const expiringUnits = await bloodUnitModel.find({
      facilityId: inventory.facilityId._id,
      bloodGroupId: inventory.groupId._id,
      component: inventory.componentId.name,
      status: "available",
      expiresAt: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }).select("quantity expiresAt").sort({ expiresAt: 1 });

    return getInfoData({
      fields: [
        "_id",
        "facilityId",
        "componentId",
        "groupId",
        "totalQuantity",
        "createdAt",
        "updatedAt"
      ],
      object: {
        ...inventory,
        unitStats,
        expiringUnits
      },
    });
  };

  // Thống kê inventory toàn diện
  getInventoryStatistics = async (facilityId, { startDate, endDate } = {}) => {
    // Thống kê tổng quan theo component và blood type
    const overallStats = await bloodInventoryModel.aggregate([
      { $match: { facilityId } },
      {
        $lookup: {
          from: "bloodcomponents",
          localField: "componentId",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $lookup: {
          from: "bloodgroups",
          localField: "groupId", 
          foreignField: "_id",
          as: "bloodGroup"
        }
      },
      { $unwind: "$component" },
      { $unwind: "$bloodGroup" },
      {
        $group: {
          _id: {
            component: "$component.name",
            bloodType: "$bloodGroup.name"
          },
          totalQuantity: { $sum: "$totalQuantity" }
        }
      },
      {
        $group: {
          _id: "$_id.component",
          bloodTypes: {
            $push: {
              type: "$_id.bloodType", 
              quantity: "$totalQuantity"
            }
          },
          totalQuantity: { $sum: "$totalQuantity" }
        }
      }
    ]);

    // Thống kê units theo status với date filter
    const matchQuery = { facilityId };
    if (startDate || endDate) {
      matchQuery.collectedAt = {};
      if (startDate) matchQuery.collectedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.collectedAt.$lte = new Date(endDate);
    }

    const unitStatusStats = await bloodUnitModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);

    // Units sắp hết hạn (trong 7 ngày)
    const expiringUnitsCount = await bloodUnitModel.countDocuments({
      facilityId,
      status: "available",
      expiresAt: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Units đã hết hạn
    const expiredUnitsCount = await bloodUnitModel.countDocuments({
      facilityId,
      status: "available",
      expiresAt: { $lt: new Date() }
    });

    return {
      overallInventory: overallStats,
      unitStatusDistribution: unitStatusStats,
      expiringUnits: expiringUnitsCount,
      expiredUnits: expiredUnitsCount,
      summary: {
        totalUnits: unitStatusStats.reduce((sum, stat) => sum + stat.count, 0),
        availableUnits: unitStatusStats.find(s => s._id === "available")?.count || 0,
        reservedUnits: unitStatusStats.find(s => s._id === "reserved")?.count || 0,
        usedUnits: unitStatusStats.find(s => s._id === "used")?.count || 0,
      }
    };
  };

  // Lấy units sắp hết hạn
  getExpiringUnits = async (facilityId, { days = 7, page = 1, limit = 10 }) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const result = await getPaginatedData({
      model: bloodUnitModel,
      query: {
        facilityId,
        status: "available",
        expiresAt: {
          $gte: new Date(),
          $lte: expiryDate
        }
      },
      page,
      limit,
      select: "_id donationId bloodGroupId component quantity collectedAt expiresAt",
      populate: [
        { path: "bloodGroupId", select: "name type" },
        { path: "donationId", select: "userId", populate: { path: "userId", select: "fullName" } }
      ],
      sort: { expiresAt: 1 },
    });

    return result;
  };

  // Cập nhật trạng thái units hết hạn
  updateExpiredUnits = async (facilityId) => {
    const result = await bloodUnitModel.updateMany(
      {
        facilityId,
        status: "available",
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: "expired" }
      }
    );

    // Cập nhật inventory tương ứng nếu có units expired
    if (result.modifiedCount > 0) {
      const expiredUnits = await bloodUnitModel.find({
        facilityId,
        status: "expired",
        expiresAt: { $lt: new Date() }
      }).populate("bloodGroupId");

      // Group by component and blood group để update inventory
      const updates = {};
      for (const unit of expiredUnits) {
        const key = `${unit.component}_${unit.bloodGroupId._id}`;
        if (!updates[key]) {
          updates[key] = {
            component: unit.component,
            bloodGroupId: unit.bloodGroupId._id,
            quantity: 0
          };
        }
        updates[key].quantity += unit.quantity;
      }

      // Update inventory quantities
      for (const update of Object.values(updates)) {
        const bloodComponentModel = require("../models/bloodComponent.model");
        const componentDoc = await bloodComponentModel.findOne({ name: update.component });
        
        if (componentDoc) {
          await bloodInventoryModel.findOneAndUpdate(
            {
              facilityId,
              componentId: componentDoc._id,
              groupId: update.bloodGroupId
            },
            {
              $inc: { totalQuantity: -update.quantity }
            }
          );
        }
      }
    }

    return {
      expiredUnitsCount: result.modifiedCount,
      message: `Đã cập nhật ${result.modifiedCount} units hết hạn`
    };
  };

  // Reserve blood units cho request
  reserveUnits = async (facilityId, { component, bloodGroupId, quantity, requestId }) => {
    if (!component || !bloodGroupId || !quantity || !requestId) {
      throw new BadRequestError("Thiếu thông tin bắt buộc để reserve units");
    }

    // Tìm units có sẵn, ưu tiên units sắp hết hạn trước (FIFO)
    const availableUnits = await bloodUnitModel
      .find({
        facilityId,
        component,
        bloodGroupId,
        status: "available"
      })
      .sort({ expiresAt: 1 }) // Ưu tiên units sắp hết hạn trước
      .limit(Math.ceil(quantity / 100)); // Estimate số units cần

    let reservedQuantity = 0;
    const reservedUnits = [];

    for (const unit of availableUnits) {
      if (reservedQuantity >= quantity) break;

      const reserveQty = Math.min(unit.quantity, quantity - reservedQuantity);
      
      // Update unit status và link với blood request
      unit.status = "reserved";
      unit.bloodRequestId = requestId;
      await unit.save();

      reservedUnits.push(unit);
      reservedQuantity += reserveQty;
    }

    return {
      reservedUnits,
      reservedQuantity,
      requestedQuantity: quantity,
      fulfilled: reservedQuantity >= quantity
    };
  };

  // Helper method: Cập nhật inventory khi blood unit được approve
  updateInventoryFromUnit = async (bloodUnit) => {
    const { facilityId, bloodGroupId, component, quantity } = bloodUnit;

    // Tìm component ID
    const componentDoc = await bloodComponentModel.findOne({ name: component });
    if (!componentDoc) return;

    // Tìm hoặc tạo inventory record
    let inventory = await this.findInventory(facilityId, componentDoc._id, bloodGroupId);

    if (inventory) {
      inventory.totalQuantity += quantity;
      await inventory.save();
    } else {
      await this.createInventory(facilityId, componentDoc._id, bloodGroupId, quantity);
    }
  };

  // Helper: Find inventory record
  findInventory = async (facilityId, componentId, groupId) => {
    return await bloodInventoryModel.findOne({
      facilityId,
      componentId,
      groupId
    });
  };

  // Helper: Create inventory record
  createInventory = async (facilityId, componentId, groupId, quantity) => {
    return await bloodInventoryModel.create({
      facilityId,
      componentId: componentId,
      groupId: groupId,
      totalQuantity: quantity
    });
  };
}

module.exports = new BloodInventoryService(); 