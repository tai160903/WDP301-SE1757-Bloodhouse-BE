"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getInfoData } = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const GiftInventory = require("../models/giftInventory.model");
const GiftItem = require("../models/giftItem.model");
const GiftDistribution = require("../models/giftDistribution.model");
const GiftPackage = require("../models/giftPackage.model");
const GiftBudget = require("../models/giftBudget.model");
const GiftLog = require("../models/giftLog.model");
const Notification = require("../models/notification.model");
const BloodDonation = require("../models/bloodDonation.model");
const { USER_ROLE } = require("../constants/enum");

class GiftService {
  // ===== GIFT ITEMS MANAGEMENT =====
  
  async createGiftItem(giftItemData) {
    const { name, description, image, unit, category, costPerUnit } = giftItemData;
    
    // Check if gift item with same name exists
    const existingItem = await GiftItem.findOne({ name });
    if (existingItem) {
      throw new BadRequestError("Gift item with this name already exists");
    }

    const giftItem = new GiftItem({
      name,
      description,
      image,
      unit,
      category,
      costPerUnit,
    });

    await giftItem.save();
    return getInfoData({
      fields: ["_id", "name", "description", "image", "unit", "category", "costPerUnit", "isActive", "createdAt"],
      object: giftItem,
    });
  }

  async getGiftItems({ category, isActive = true, search, page = 1, limit = 10 }) {
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive;

    const result = await getPaginatedData({
      model: GiftItem,
      query,
      page,
      limit,
      select: "_id name description image unit category costPerUnit isActive createdAt",
      search,
      searchFields: ["name", "description"],
      sort: { createdAt: -1 },
    });

    return result;
  }

  async getGiftItemById(giftItemId) {
    const giftItem = await GiftItem.findById(giftItemId);
    if (!giftItem) {
      throw new NotFoundError("Gift item not found");
    }
    return getInfoData({
      fields: ["_id", "name", "description", "image", "unit", "category", "costPerUnit", "isActive", "createdAt"],
      object: giftItem,
    });
  }

  async updateGiftItem(giftItemId, updateData) {
    const giftItem = await GiftItem.findById(giftItemId);
    if (!giftItem) {
      throw new NotFoundError("Gift item not found");
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== giftItem.name) {
      const existingItem = await GiftItem.findOne({ name: updateData.name });
      if (existingItem) {
        throw new BadRequestError("Gift item with this name already exists");
      }
    }

    Object.assign(giftItem, updateData);
    await giftItem.save();

    return getInfoData({
      fields: ["_id", "name", "description", "image", "unit", "category", "costPerUnit", "isActive", "updatedAt"],
      object: giftItem,
    });
  }

  async deleteGiftItem(giftItemId) {
    const giftItem = await GiftItem.findById(giftItemId);
    if (!giftItem) {
      throw new NotFoundError("Gift item not found");
    }

    // Check if item is used in any inventory
    const inventoryCount = await GiftInventory.countDocuments({ giftItemId });
    if (inventoryCount > 0) {
      // Soft delete - set isActive to false
      giftItem.isActive = false;
      await giftItem.save();
      return { message: "Gift item deactivated successfully (has inventory records)" };
    } else {
      // Hard delete if no inventory records
      await giftItem.deleteOne();
      return { message: "Gift item deleted successfully" };
    }
  }

  // ===== GIFT PACKAGES MANAGEMENT =====

  async createGiftPackage(packageData) {
    const { name, description, items, minAge, maxAge, image, priority, createdBy, facilityId } = packageData;

    // Validate facility-specific createdBy
    if (!facilityId) {
      throw new BadRequestError("Facility ID is required for package creation");
    }

    // Check if package name exists in the same facility
    const existingPackage = await GiftPackage.findOne({ 
      name, 
      facilityId,
      isActive: true 
    });
    if (existingPackage) {
      throw new BadRequestError("Package with this name already exists in this facility");
    }

    // Validate gift items exist and are active
    const giftItemIds = items.map(item => item.giftItemId);
    const existingItems = await GiftItem.find({ 
      _id: { $in: giftItemIds }, 
      isActive: true 
    });

    if (existingItems.length !== giftItemIds.length) {
      throw new BadRequestError("Some gift items in package do not exist or are inactive");
    }

    // Validate that all items have sufficient inventory at this facility
    const inventoryChecks = await Promise.all(
      items.map(async (item) => {
        const inventory = await GiftInventory.findOne({
          facilityId,
          giftItemId: item.giftItemId,
          isActive: true
        });
        return {
          giftItemId: item.giftItemId,
          requiredQuantity: item.quantity,
          availableQuantity: inventory ? inventory.availableQuantity : 0,
          hasEnough: inventory && inventory.availableQuantity >= item.quantity
        };
      })
    );

    const insufficientItems = inventoryChecks.filter(check => !check.hasEnough);
    if (insufficientItems.length > 0) {
      throw new BadRequestError(
        `Insufficient inventory for items: ${insufficientItems.map(item => 
          `${item.giftItemId} (need: ${item.requiredQuantity}, available: ${item.availableQuantity})`
        ).join(', ')}`
      );
    }

    const giftPackage = new GiftPackage({
      name,
      description,
      facilityId,
      items,
      minAge,
      maxAge,
      image,
      priority,
      createdBy,
    });

    await giftPackage.save();

    // Create log
    await new GiftLog({
      facilityId,
      packageId: giftPackage._id,
      action: "CREATE_PACKAGE",
      userId: createdBy,
      details: { 
        name: giftPackage.name,
        itemCount: items.length,
        items: items.map(item => ({ giftItemId: item.giftItemId, quantity: item.quantity }))
      },
    }).save();

    return getInfoData({
      fields: ["_id", "name", "description", "facilityId", "items", "minAge", "maxAge", "image", "priority", "isActive", "createdAt"],
      object: giftPackage,
    });
  }

  async getGiftPackages({ facilityId, isActive = true, search, page = 1, limit = 10 }) {
    const query = {};
    
    // Always filter by facility for staff, admins can see all
    if (facilityId) {
      query.facilityId = facilityId;
    }
    
    if (isActive !== undefined) query.isActive = isActive;

    const result = await getPaginatedData({
      model: GiftPackage,
      query,
      page,
      limit,
      select: "_id name description facilityId items minAge maxAge image priority isActive createdAt",
      populate: [
        { 
          path: "items.giftItemId", 
          select: "name unit category costPerUnit"
        },
        {
          path: "facilityId",
          select: "name code"
        }
      ],
      search,
      searchFields: ["name", "description"],
      sort: { priority: -1, createdAt: -1 },
    });

    return result;
  }

  async getGiftPackageById(packageId, facilityId = null) {
    const query = { _id: packageId };
    
    // Filter by facility if provided (for staff)
    if (facilityId) {
      query.facilityId = facilityId;
    }
    
    const giftPackage = await GiftPackage.findOne(query)
      .populate('items.giftItemId', 'name unit category costPerUnit')
      .populate('facilityId', 'name code');
    
    if (!giftPackage) {
      throw new NotFoundError("Gift package not found or access denied");
    }
    
    return getInfoData({
      fields: ["_id", "name", "description", "facilityId", "items", "minAge", "maxAge", "image", "priority", "isActive", "createdAt"],
      object: giftPackage,
    });
  }

  async updateGiftPackage(packageId, updateData, updatedBy) {
    const { facilityId } = updatedBy;
    
    // Find package with facility check
    const giftPackage = await GiftPackage.findOne({ 
      _id: packageId, 
      facilityId: facilityId 
    });
    if (!giftPackage) {
      throw new NotFoundError("Gift package not found or access denied");
    }

    // Check name uniqueness in facility if name is being updated
    if (updateData.name && updateData.name !== giftPackage.name) {
      const existingPackage = await GiftPackage.findOne({
        name: updateData.name,
        facilityId,
        _id: { $ne: packageId },
        isActive: true
      });
      if (existingPackage) {
        throw new BadRequestError("Package with this name already exists in this facility");
      }
    }

    // Validate gift items if items are being updated
    if (updateData.items) {
      const giftItemIds = updateData.items.map(item => item.giftItemId);
      const existingItems = await GiftItem.find({ 
        _id: { $in: giftItemIds }, 
        isActive: true 
      });

      if (existingItems.length !== giftItemIds.length) {
        throw new BadRequestError("Some gift items in package do not exist or are inactive");
      }

      // Validate inventory availability for updated items
      const inventoryChecks = await Promise.all(
        updateData.items.map(async (item) => {
          const inventory = await GiftInventory.findOne({
            facilityId,
            giftItemId: item.giftItemId,
            isActive: true
          });
          return {
            giftItemId: item.giftItemId,
            requiredQuantity: item.quantity,
            availableQuantity: inventory ? inventory.availableQuantity : 0,
            hasEnough: inventory && inventory.availableQuantity >= item.quantity
          };
        })
      );

      const insufficientItems = inventoryChecks.filter(check => !check.hasEnough);
      if (insufficientItems.length > 0) {
        throw new BadRequestError(
          `Insufficient inventory for items: ${insufficientItems.map(item => 
            `${item.giftItemId} (need: ${item.requiredQuantity}, available: ${item.availableQuantity})`
          ).join(', ')}`
        );
      }
    }

    Object.assign(giftPackage, updateData);
    await giftPackage.save();

    // Create log
    await new GiftLog({
      facilityId,
      packageId: giftPackage._id,
      action: "UPDATE_PACKAGE",
      userId: updatedBy.staffId,
      details: { 
        name: giftPackage.name,
        changes: updateData
      },
    }).save();

    return getInfoData({
      fields: ["_id", "name", "description", "facilityId", "items", "minAge", "maxAge", "image", "priority", "isActive", "updatedAt"],
      object: giftPackage,
    });
  }

  async deleteGiftPackage(packageId, deletedBy) {
    const { facilityId } = deletedBy;
    
    // Find package with facility check
    const giftPackage = await GiftPackage.findOne({ 
      _id: packageId, 
      facilityId: facilityId 
    });
    if (!giftPackage) {
      throw new NotFoundError("Gift package not found or access denied");
    }

    // Check if package has been used in distributions
    const distributionCount = await GiftDistribution.countDocuments({ packageId });
    if (distributionCount > 0) {
      // Soft delete
      giftPackage.isActive = false;
      await giftPackage.save();
      
      // Create log
      await new GiftLog({
        facilityId,
        packageId: giftPackage._id,
        action: "DELETE_PACKAGE",
        userId: deletedBy.staffId,
        details: { 
          name: giftPackage.name,
          type: "soft_delete",
          reason: "has_distribution_history"
        },
      }).save();

      return { message: "Gift package deactivated successfully (has distribution history)" };
    } else {
      // Hard delete
      await giftPackage.deleteOne();
      
      // Create log
      await new GiftLog({
        facilityId,
        packageId: packageId,
        action: "DELETE_PACKAGE",
        userId: deletedBy.staffId,
        details: { 
          name: giftPackage.name,
          type: "hard_delete"
        },
      }).save();

      return { message: "Gift package deleted successfully" };
    }
  }

  // ===== INVENTORY MANAGEMENT =====

  async addGiftToInventory({ facilityId, giftItemId, quantity, costPerUnit, managerId }) {
    // Validate input
    if (!facilityId || !giftItemId || !quantity || costPerUnit === undefined) {
      throw new BadRequestError("facilityId, giftItemId, quantity, and costPerUnit are required");
    }
    if (quantity < 0 || costPerUnit < 0) {
      throw new BadRequestError("quantity and costPerUnit must be non-negative");
    }

    // Kiểm tra giftItem tồn tại và active
    const giftItem = await GiftItem.findOne({ _id: giftItemId, isActive: true });
    if (!giftItem) throw new NotFoundError("Gift item not found or inactive");

    // Kiểm tra ngân sách
    let budget = await GiftBudget.findOne({
      facilityId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    if (!budget) {
      budget = new GiftBudget({
        facilityId,
        budget: 0,
        spent: 0,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      });
      await budget.save();
    }
    
    const totalCost = quantity * costPerUnit;
    const newSpent = budget.spent + totalCost;
    if (newSpent > budget.budget) {
      throw new BadRequestError(`Insufficient budget. Required: ${totalCost}, Available: ${budget.budget - budget.spent}`);
    }

    // Thêm hoặc cập nhật kho
    let inventory = await GiftInventory.findOne({ facilityId, giftItemId });
    if (inventory) {
      inventory.quantity += quantity;
      inventory.costPerUnit = costPerUnit; // Cập nhật chi phí mới
      inventory.lastStockDate = new Date();
      inventory.updatedAt = new Date();
    } else {
      inventory = new GiftInventory({
        facilityId,
        giftItemId,
        quantity,
        costPerUnit,
        lastStockDate: new Date(),
      });
    }
    await inventory.save();

    // Cập nhật ngân sách
    budget.spent = newSpent;
    await budget.save();

    // Ghi log
    await new GiftLog({
      facilityId,
      giftItemId,
      action: "STOCK_IN",
      userId: managerId,
      details: { name: giftItem.name, quantity, costPerUnit, totalCost },
    }).save();

    // Kiểm tra tồn kho thấp
    if (inventory.quantity < inventory.minStockLevel) {
      await new Notification({
        userId: managerId,
        message: `Gift ${giftItem.name} at facility ${facilityId} is low (quantity: ${inventory.quantity})`,
        type: "LOW_INVENTORY",
      }).save();
    }

    return getInfoData({
      fields: ["_id", "facilityId", "giftItemId", "quantity", "costPerUnit", "minStockLevel", "lastStockDate", "createdAt"],
      object: inventory,
    });
  }

  async updateGiftInventory({ inventoryId, updates, managerId, facilityId }) {
    const { quantity, costPerUnit, minStockLevel } = updates;

    // Validate input
    if (!inventoryId) throw new BadRequestError("inventoryId is required");
    if (quantity !== undefined && quantity < 0) {
      throw new BadRequestError("quantity must be non-negative");
    }
    if (costPerUnit !== undefined && costPerUnit < 0) {
      throw new BadRequestError("costPerUnit must be non-negative");
    }

    // Tìm kho
    const inventory = await GiftInventory.findOne({ _id: inventoryId, facilityId }).populate("giftItemId");
    if (!inventory) throw new NotFoundError("Inventory not found or unauthorized");

    // Tính toán ngân sách nếu có thay đổi cost
    const oldQuantity = inventory.quantity;
    const oldCost = inventory.costPerUnit;
    const newQuantity = quantity !== undefined ? quantity : oldQuantity;
    const newCost = costPerUnit !== undefined ? costPerUnit : oldCost;

    if (costPerUnit !== undefined) {
      const budget = await GiftBudget.findOne({
        facilityId,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });
      if (!budget) throw new NotFoundError("No active budget found");

      const costDiff = newQuantity * newCost - oldQuantity * oldCost;
      if (budget.spent + costDiff > budget.budget) {
        throw new BadRequestError("Insufficient budget for this update");
      }

      // Cập nhật ngân sách
      budget.spent += costDiff;
      await budget.save();
    }

    // Cập nhật kho
    if (quantity !== undefined) inventory.quantity = quantity;
    if (costPerUnit !== undefined) inventory.costPerUnit = costPerUnit;
    if (minStockLevel !== undefined) inventory.minStockLevel = minStockLevel;
    inventory.updatedAt = new Date();
    await inventory.save();

    // Ghi log
    const action = quantity !== undefined && quantity !== oldQuantity ? 
      (quantity > oldQuantity ? "STOCK_IN" : "STOCK_OUT") : "UPDATE";
    
    await new GiftLog({
      facilityId,
      giftItemId: inventory.giftItemId._id,
      action,
      userId: managerId,
      details: { 
        name: inventory.giftItemId.name, 
        oldQuantity, 
        newQuantity, 
        oldCost, 
        newCost,
        quantityChange: newQuantity - oldQuantity
      },
    }).save();

    // Kiểm tra tồn kho thấp
    if (inventory.quantity < inventory.minStockLevel) {
      await new Notification({
        userId: managerId,
        message: `Gift ${inventory.giftItemId.name} at facility ${facilityId} is low (quantity: ${inventory.quantity})`,
        type: "LOW_INVENTORY",
      }).save();
    }

    return getInfoData({
      fields: ["_id", "facilityId", "giftItemId", "quantity", "costPerUnit", "minStockLevel", "updatedAt"],
      object: inventory,
    });
  }

  async deleteGiftInventory({ inventoryId, managerId, facilityId }) {
    // Tìm kho
    const inventory = await GiftInventory.findOne({ _id: inventoryId, facilityId }).populate("giftItemId");
    if (!inventory) throw new NotFoundError("Inventory not found or unauthorized");
    
    if (inventory.quantity > 0) {
      throw new BadRequestError("Cannot delete inventory with quantity > 0. Please reduce quantity to 0 first.");
    }

    // Xóa kho
    await inventory.deleteOne();

    // Ghi log
    await new GiftLog({
      facilityId,
      giftItemId: inventory.giftItemId._id,
      action: "DELETE_INVENTORY",
      userId: managerId,
      details: { name: inventory.giftItemId.name },
    }).save();

    return { message: "Inventory deleted successfully" };
  }

  async getGiftInventory({ facilityId, query }) {
    const { page = 1, limit = 10, sort = "-lastStockDate", search, category, lowStock } = query;

    // Validate
    if (!facilityId) throw new BadRequestError("facilityId is required");

    // Build query
    const matchQuery = { facilityId, isActive: true };

    const result = await getPaginatedData({
      model: GiftInventory,
      query: matchQuery,
      page,
      limit,
      select: "_id facilityId giftItemId quantity reservedQuantity costPerUnit minStockLevel lastStockDate isActive createdAt updatedAt",
      populate: [
        { path: "giftItemId", select: "name description image unit category isActive" }
      ],
      search,
      searchFields: ["giftItemId.name", "giftItemId.description"],
      sort: sort,
    });

    // Filter by category if specified
    if (category) {
      result.data = result.data.filter(inv => inv.giftItemId?.category === category);
    }

    // Filter low stock if specified
    if (lowStock === 'true') {
      result.data = result.data.filter(inv => inv.quantity <= inv.minStockLevel);
    }

    // Add available quantity virtual field
    result.data = result.data.map(inv => ({
      ...inv.toObject(),
      availableQuantity: inv.quantity - inv.reservedQuantity
    }));

    return result;
  }

  // ===== GIFT DISTRIBUTION =====

  async distributeGiftPackage({ facilityId, packageId, donationId, notes, distributedBy }) {
    // Validate inputs
    if (!facilityId || !packageId || !donationId || !distributedBy) {
      throw new BadRequestError("facilityId, packageId, donationId, and distributedBy are required");
    }

    // Check if donation exists and is completed
    const donation = await BloodDonation.findById(donationId).populate('userId');
    if (!donation) {
      throw new NotFoundError("Blood donation not found");
    }
    if (donation.status !== 'completed') {
      throw new BadRequestError("Can only distribute gifts for completed donations");
    }

    // Check if already distributed for this donation
    const existingDistribution = await GiftDistribution.findOne({ donationId });
    if (existingDistribution) {
      throw new BadRequestError("Gifts already distributed for this donation");
    }

    // Get package details
    const giftPackage = await GiftPackage.findOne({ _id: packageId, isActive: true })
      .populate('items.giftItemId');
    if (!giftPackage) {
      throw new NotFoundError("Gift package not found or inactive");
    }

    // Check inventory availability for all items
    let totalCost = 0;
    const inventoryUpdates = [];
    
    for (const packageItem of giftPackage.items) {
      const inventory = await GiftInventory.findOne({ 
        facilityId, 
        giftItemId: packageItem.giftItemId._id,
        isActive: true 
      });
      
      if (!inventory) {
        throw new BadRequestError(`Gift item ${packageItem.giftItemId.name} not available in facility inventory`);
      }
      
      if (inventory.quantity - inventory.reservedQuantity < packageItem.quantity) {
        throw new BadRequestError(`Insufficient quantity for ${packageItem.giftItemId.name}. Available: ${inventory.quantity - inventory.reservedQuantity}, Required: ${packageItem.quantity}`);
      }

      const itemCost = packageItem.quantity * packageItem.giftItemId.costPerUnit;
      totalCost += itemCost;
      
      inventoryUpdates.push({
        inventory,
        packageItem,
        itemCost
      });
    }

    // Create individual distribution records and update inventory
    const distributionItems = [];
    for (const update of inventoryUpdates) {
      const { inventory, packageItem, itemCost } = update;
      
      // Create distribution item
      const distributionItem = new GiftDistribution({
        facilityId,
        giftItemId: packageItem.giftItemId._id,
        userId: donation.userId._id,
        donationId,
        packageId,
        quantity: packageItem.quantity,
        costPerUnit: packageItem.giftItemId.costPerUnit,
        distributedBy,
        notes,
      });
      await distributionItem.save();
      distributionItems.push(distributionItem);

      // Update inventory
      inventory.quantity -= packageItem.quantity;
      inventory.updatedAt = new Date();
      await inventory.save();
    }

    // Update budget
    const budget = await GiftBudget.findOne({
      facilityId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    if (budget) {
      budget.spent += totalCost;
      await budget.save();
    }

    // Create log
    await new GiftLog({
      facilityId,
      packageId,
      action: "DISTRIBUTE_PACKAGE",
      userId: distributedBy,
      donationId,
      details: {
        packageName: giftPackage.name,
        recipientName: donation.userId.fullName,
        totalCost,
        items: giftPackage.items.map(item => ({
          name: item.giftItemId.name,
          quantity: item.quantity,
          costPerUnit: item.giftItemId.costPerUnit
        }))
      },
    }).save();

    // Create notification for donor
    const itemNames = giftPackage.items.map(item => `${item.quantity} ${item.giftItemId.name}`).join(', ');
    await new Notification({
      userId: donation.userId._id,
      message: `Bạn đã nhận được gói quà tặng "${giftPackage.name}" bao gồm: ${itemNames}`,
      type: "GIFT",
    }).save();

    return {
      packageName: giftPackage.name,
      totalCost,
      items: distributionItems.map(item => getInfoData({
        fields: ["_id", "giftItemId", "quantity", "costPerUnit", "distributedAt"],
        object: item,
      }))
    };
  }

  async distributeGift({ facilityId, giftItemId, donationId, quantity = 1, notes, distributedBy }) {
    // Validate inputs
    if (!facilityId || !giftItemId || !donationId || !distributedBy) {
      throw new BadRequestError("facilityId, giftItemId, donationId, and distributedBy are required");
    }
    if (quantity < 1) {
      throw new BadRequestError("quantity must be at least 1");
    }

    // Check if donation exists and is completed
    const donation = await BloodDonation.findById(donationId).populate('userId');
    if (!donation) {
      throw new NotFoundError("Blood donation not found");
    }
    if (donation.status !== 'completed') {
      throw new BadRequestError("Can only distribute gifts for completed donations");
    }

    // Check if already distributed for this donation
    const existingDistribution = await GiftDistribution.findOne({ donationId });
    if (existingDistribution) {
      throw new BadRequestError("Gifts already distributed for this donation");
    }

    // Check if gift item exists and is active
    const giftItem = await GiftItem.findOne({ _id: giftItemId, isActive: true });
    if (!giftItem) {
      throw new NotFoundError("Gift item not found or inactive");
    }

    // Check inventory availability
    const inventory = await GiftInventory.findOne({ facilityId, giftItemId, isActive: true });
    if (!inventory) {
      throw new NotFoundError("Gift item not available in facility inventory");
    }
    if (inventory.quantity - inventory.reservedQuantity < quantity) {
      throw new BadRequestError(`Insufficient quantity. Available: ${inventory.quantity - inventory.reservedQuantity}, Requested: ${quantity}`);
    }

    const totalCost = quantity * giftItem.costPerUnit;

    // Create distribution record
    const distribution = new GiftDistribution({
      facilityId,
      giftItemId,
      userId: donation.userId._id,
      donationId,
      packageId: null, // Single item distribution
      quantity,
      costPerUnit: giftItem.costPerUnit,
      distributedBy,
      notes,
    });
    await distribution.save();

    // Update inventory
    inventory.quantity -= quantity;
    inventory.updatedAt = new Date();
    await inventory.save();

    // Update budget
    const budget = await GiftBudget.findOne({
      facilityId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    if (budget) {
      budget.spent += totalCost;
      await budget.save();
    }

    // Create log
    await new GiftLog({
      facilityId,
      giftItemId,
      action: "DISTRIBUTE",
      userId: distributedBy,
      donationId,
      details: {
        name: giftItem.name,
        quantity,
        costPerUnit: giftItem.costPerUnit,
        recipientName: donation.userId.fullName,
        totalCost,
      },
    }).save();

    // Create notification for donor
    await new Notification({
      userId: donation.userId._id,
      message: `Bạn đã nhận được quà tặng ${giftItem.name} (${quantity} ${giftItem.unit}) từ việc hiến máu`,
      type: "GIFT",
    }).save();

    return getInfoData({
      fields: ["_id", "facilityId", "giftItemId", "userId", "donationId", "quantity", "costPerUnit", "distributedBy", "distributedAt", "notes"],
      object: distribution,
    });
  }

  async getAvailableGiftsForDistribution({ facilityId, donationId }) {
    // Check donation exists and is completed
    const donation = await BloodDonation.findById(donationId);
    if (!donation) {
      throw new NotFoundError("Blood donation not found");
    }
    if (donation.status !== 'completed') {
      throw new BadRequestError("Can only distribute gifts for completed donations");
    }

    // Check if already distributed
    const existingDistribution = await GiftDistribution.findOne({ donationId });
    if (existingDistribution) {
      throw new BadRequestError("Gifts already distributed for this donation");
    }

    // Get available packages
    const packages = await GiftPackage.find({ isActive: true })
      .populate('items.giftItemId', 'name unit category costPerUnit')
      .sort({ priority: -1, createdAt: -1 });

    // Filter packages based on inventory availability
    const availablePackages = [];
    for (const pkg of packages) {
      let canDistribute = true;
      const packageItems = [];
      
      for (const item of pkg.items) {
        const inventory = await GiftInventory.findOne({
          facilityId,
          giftItemId: item.giftItemId._id,
          isActive: true
        });
        
        if (!inventory || inventory.quantity - inventory.reservedQuantity < item.quantity) {
          canDistribute = false;
          break;
        }
        
        packageItems.push({
          giftItem: item.giftItemId,
          quantity: item.quantity,
          availableQuantity: inventory.quantity - inventory.reservedQuantity
        });
      }
      
      if (canDistribute) {
        availablePackages.push({
          package: pkg,
          items: packageItems,
          totalCost: packageItems.reduce((sum, item) => sum + (item.quantity * item.giftItem.costPerUnit), 0)
        });
      }
    }

    // Get individual available gifts
    const inventories = await GiftInventory.find({ 
      facilityId, 
      isActive: true,
      $expr: { $gt: ["$quantity", "$reservedQuantity"] }
    }).populate({
      path: 'giftItemId',
      match: { isActive: true },
      select: 'name description image unit category costPerUnit'
    });

    const availableGifts = inventories
      .filter(inv => inv.giftItemId)
      .map(inv => ({
        inventoryId: inv._id,
        giftItem: inv.giftItemId,
        availableQuantity: inv.quantity - inv.reservedQuantity,
      }));

    return { 
      packages: availablePackages,
      individualGifts: availableGifts 
    };
  }

  // ===== BUDGET MANAGEMENT =====

  async manageBudget({ facilityId, budget, startDate, endDate, managerId }) {
    // Validate input
    if (!facilityId || budget === undefined || !startDate || !endDate) {
      throw new BadRequestError("facilityId, budget, startDate, and endDate are required");
    }
    if (budget < 0) throw new BadRequestError("budget must be non-negative");
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      throw new BadRequestError("startDate and endDate must be valid dates");
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj >= endDateObj) {
      throw new BadRequestError("startDate must be before endDate");
    }

    // Tìm hoặc tạo ngân sách
    let giftBudget = await GiftBudget.findOne({ facilityId });
    if (giftBudget) {
      if (giftBudget.spent > budget) {
        throw new BadRequestError(`New budget cannot be less than spent amount (${giftBudget.spent})`);
      }
      giftBudget.budget = budget;
      giftBudget.startDate = startDateObj;
      giftBudget.endDate = endDateObj;
      giftBudget.updatedAt = new Date();
    } else {
      giftBudget = new GiftBudget({
        facilityId,
        budget,
        spent: 0,
        startDate: startDateObj,
        endDate: endDateObj,
      });
    }
    await giftBudget.save();

    // Ghi log
    await new GiftLog({
      facilityId,
      giftItemId: null,
      action: "UPDATE_BUDGET",
      userId: managerId,
      details: { budget, startDate, endDate },
    }).save();

    return getInfoData({
      fields: ["_id", "facilityId", "budget", "spent", "startDate", "endDate", "createdAt", "updatedAt"],
      object: giftBudget,
    });
  }

  async getBudget({ facilityId }) {
    if (!facilityId) throw new BadRequestError("facilityId is required");

    const budget = await GiftBudget.findOne({ facilityId });
    if (!budget) {
      throw new NotFoundError("Budget not found for this facility");
    }

    return getInfoData({
      fields: ["_id", "facilityId", "budget", "spent", "startDate", "endDate", "createdAt", "updatedAt"],
      object: budget,
    });
  }

  // ===== REPORTS =====

  async getDistributionReport({ facilityId, query }) {
    const { startDate, endDate, page = 1, limit = 10, giftItemId, distributedBy, packageId } = query;

    // Validate
    if (!facilityId) throw new BadRequestError("facilityId is required");
    if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
      throw new BadRequestError("startDate and endDate must be valid dates");
    }

    // Build query
    const match = { facilityId };
    if (startDate) match.distributedAt = { $gte: new Date(startDate) };
    if (endDate) match.distributedAt = { ...match.distributedAt, $lte: new Date(endDate) };
    if (giftItemId) match.giftItemId = giftItemId;
    if (distributedBy) match.distributedBy = distributedBy;
    if (packageId) match.packageId = packageId;

    const result = await getPaginatedData({
      model: GiftDistribution,
      query: match,
      page,
      limit,
      select: "_id facilityId giftItemId userId donationId packageId quantity costPerUnit distributedBy distributedAt notes",
      populate: [
        { path: "userId", select: "fullName email phone" },
        { path: "giftItemId", select: "name description unit category" },
        { path: "packageId", select: "name description" },
        { path: "donationId", select: "donationDate quantity" },
        { 
          path: "distributedBy", 
          select: "userId position", 
          populate: { path: "userId", select: "fullName" }
        },
      ],
      sort: { distributedAt: -1 },
    });

    // Calculate summary
    const summary = await GiftDistribution.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalDistributions: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalCost: { $sum: { $multiply: ["$quantity", "$costPerUnit"] } },
        },
      },
    ]);

    return {
      ...result,
      summary: {
        totalDistributions: summary[0]?.totalDistributions || 0,
        totalQuantity: summary[0]?.totalQuantity || 0,
        totalCost: summary[0]?.totalCost || 0,
      },
    };
  }

  async getGiftLogs({ facilityId, query }) {
    const { page = 1, limit = 10, action, giftItemId, userId, packageId, startDate, endDate } = query;

    if (!facilityId) throw new BadRequestError("facilityId is required");

    // Build query
    const match = { facilityId };
    if (action) match.action = action;
    if (giftItemId) match.giftItemId = giftItemId;
    if (packageId) match.packageId = packageId;
    if (userId) match.userId = userId;
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    const result = await getPaginatedData({
      model: GiftLog,
      query: match,
      page,
      limit,
      select: "_id facilityId giftItemId packageId action userId donationId details timestamp",
      populate: [
        { path: "giftItemId", select: "name unit" },
        { path: "packageId", select: "name" },
        { 
          path: "userId", 
          select: "userId position", 
          populate: { path: "userId", select: "fullName" }
        },
        { path: "donationId", select: "donationDate" },
      ],
      sort: { timestamp: -1 },
    });

    return result;
  }
}

module.exports = new GiftService();