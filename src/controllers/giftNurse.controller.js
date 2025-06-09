"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { GIFT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const giftService = require("../services/gift.service");

class GiftNurseController {
  // ===== GIFT ITEMS (Read Only) =====
  
  getGiftItems = asyncHandler(async (req, res) => {
    // Nurse can only view active gift items
    const query = { ...req.query, isActive: true };
    const result = await giftService.getGiftItems(query);
    new OK({
      message: GIFT_MESSAGE.GIFT_ITEM_GET_SUCCESS,
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

  // ===== GIFT PACKAGES (Read Only) =====

  getGiftPackages = asyncHandler(async (req, res) => {
    // Nurse can only view active gift packages from their facility
    const query = { 
      ...req.query, 
      isActive: true,
      facilityId: req.user.facilityId // Filter by nurse's facility
    };
    const result = await giftService.getGiftPackages(query);
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getGiftPackageById = asyncHandler(async (req, res) => {
    const result = await giftService.getGiftPackageById(
      req.params.packageId,
      req.user.facilityId // Pass facility for access control
    );
    new OK({
      message: GIFT_MESSAGE.GIFT_PACKAGE_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== INVENTORY (Read Only) =====

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

  // ===== GIFT DISTRIBUTION =====

  getAvailableGiftsForDistribution = asyncHandler(async (req, res) => {
    const result = await giftService.getAvailableGiftsForDistribution({
      facilityId: req.user.facilityId,
      donationId: req.params.donationId,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_INVENTORY_FETCH_SUCCESS,
      data: result,
    }).send(res);
  });

  distributeGiftPackage = asyncHandler(async (req, res) => {
    const result = await giftService.distributeGiftPackage({
      ...req.body,
      distributedBy: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new CREATED({
      message: GIFT_MESSAGE.GIFT_PACKAGE_DISTRIBUTION_SUCCESS,
      data: result,
    }).send(res);
  });

  distributeGift = asyncHandler(async (req, res) => {
    const result = await giftService.distributeGift({
      ...req.body,
      distributedBy: req.user.staffId,
      facilityId: req.user.facilityId,
    });
    new CREATED({
      message: GIFT_MESSAGE.GIFT_DISTRIBUTION_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== DISTRIBUTION HISTORY =====

  getDistributionHistory = asyncHandler(async (req, res) => {
    // Nurse can see distribution history, optionally filtered by their own distributions
    const query = req.query;
    if (req.query.myDistributions === 'true') {
      query.distributedBy = req.user.staffId;
    }
    
    const result = await giftService.getDistributionReport({
      facilityId: req.user.facilityId,
      query,
    });
    new OK({
      message: GIFT_MESSAGE.GIFT_DISTRIBUTION_GET_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== BUDGET (Read Only) =====

  getBudget = asyncHandler(async (req, res) => {
    const result = await giftService.getBudget({
      facilityId: req.user.facilityId,
    });
    new OK({
      message: GIFT_MESSAGE.BUDGET_GET_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new GiftNurseController(); 