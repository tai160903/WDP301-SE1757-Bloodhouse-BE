"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { GIFT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const giftService = require("../services/gift.service");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");

class GiftManagerController {
  // ===== GIFT ITEMS MANAGEMENT =====
  
  createGiftItem = asyncHandler(async (req, res) => {
    const result = await giftService.createGiftItem(req.body);
    new CREATED({
      message: GIFT_MESSAGE.GIFT_ITEM_CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftItems = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftItems(req.query);
    new OK({
      message: GIFT_MESSAGE.GIFT_ITEM_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftItemsStats = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftItemsStats();
    new OK({
      message: "Gift items statistics retrieved successfully",
      data: result,
    }).send(res);
  });

  getGiftItemById = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftItemById(req.params.giftItemId);
    new OK({
      message: GIFT_MESSAGE.GIFT_ITEM_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  updateGiftItem = asyncHandler(async (req, res) => {
    const result = await giftService.updateGiftItem(req.params.giftItemId, req.body);
    new OK({
      message: GIFT_MESSAGE.GIFT_ITEM_UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteGiftItem = asyncHandler(async (req, res) => {
    const result = await giftService.deleteGiftItem(req.params.giftItemId);
    new OK({
      message: GIFT_MESSAGE.GIFT_ITEM_DELETE_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== GIFT PACKAGES MANAGEMENT =====

  createGiftPackage = asyncHandler(async (req, res) => {
    const { name, description, items, image, priority, quantity } = req.body;
    
    // Validate required fields
    if (!name || !items || quantity === undefined) {
      throw new BadRequestError("Name, items, and quantity are required");
    }
    
    const result = await giftService.createGiftPackage({
      name,
      description,
      items,
      image,
      priority,
      quantity,
      createdBy: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new CREATED({
      message: GIFT_MESSAGE.GIFT_PACKAGE_CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftPackages = asyncHandler(async (req, res) => {
    // Admin can see all packages, staff only see their facility's packages
    const facilityId = req.user.role === USER_ROLE.ADMIN ? null : req.user.facilityId;
    
    const result = await giftService.getGiftPackages({
      ...req.query,
      facilityId,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftPackageById = asyncHandler(async (req, res) => {
    // Admin can access any package, staff only their facility's packages
    const facilityId = req.user.role === USER_ROLE.ADMIN ? null : req.user.facilityId;
    
    const result = await giftService.getGiftPackageById(
      req.params.packageId,
      facilityId
    );
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  updateGiftPackage = asyncHandler(async (req, res) => {
    const result = await giftService.updateGiftPackage(
      req.params.packageId,
      req.body,
      { 
        staffId: req.user.staffId,
        facilityId: req.user.facilityId 
      }
    );
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  updateGiftPackageQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      throw new BadRequestError("Valid quantity is required");
    }
    
    const result = await giftService.updateGiftPackage(
      req.params.packageId,
      { quantity },
      { 
        staffId: req.user.staffId,
        facilityId: req.user.facilityId 
      }
    );
    new OK({
      message: "Package quantity updated successfully",
      data: result,
    }).send(res);
  });

  deleteGiftPackage = asyncHandler(async (req, res) => {
    const result = await giftService.deleteGiftPackage(
      req.params.packageId,
      { 
        staffId: req.user.staffId,
        facilityId: req.user.facilityId 
      }
    );
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_DELETE_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== INVENTORY MANAGEMENT =====

  addGiftToInventory = asyncHandler(async (req, res) => {
    const result = await giftService.addGiftToInventory({
      ...req.body,
      managerId: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new CREATED({
      message: GIFT_MESSAGE.GIFT_INVENTORY_ADD_SUCCESS,
      data: result,
    }).send(res);
  });

  updateGiftInventory = asyncHandler(async (req, res) => {
    const result = await giftService.updateGiftInventory({
      inventoryId: req.params.inventoryId,
      updates: req.body,
      managerId: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_INVENTORY_UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteGiftInventory = asyncHandler(async (req, res) => {
    const result = await giftService.deleteGiftInventory({
      inventoryId: req.params.inventoryId,
      managerId: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_INVENTORY_DELETE_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftInventory = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftInventory({
      facilityId: req.user.facilityId,
      query: req.query,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_INVENTORY_FETCH_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== BUDGET MANAGEMENT =====

  manageBudget = asyncHandler(async (req, res) => {
    const result = await giftService.manageBudget({
      ...req.body,
      managerId: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new CREATED({
      message: GIFT_MESSAGE.BUDGET_UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getBudget = asyncHandler(async (req, res) => {
    const result = await giftService.getBudget({
      facilityId: req.user.facilityId,
    });
    new OK({
      message: GIFT_MESSAGE.BUDGET_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== REPORTS & LOGS =====

  getDistributionReport = asyncHandler(async (req, res) => {
    const result = await giftService.getDistributionReport({
      facilityId: req.user.facilityId,
      query: req.query,
    });
    new OK({
      message: GIFT_MESSAGE.REPORT_FETCH_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftLogs = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftLogs({
      facilityId: req.user.facilityId,
      query: req.query,
    });
    new OK({
      message: GIFT_MESSAGE.LOG_GET_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new GiftManagerController();