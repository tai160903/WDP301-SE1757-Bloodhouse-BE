"use strict";

const express = require("express");
const giftManagerController = require("../../controllers/gift.controller");
const giftNurseController = require("../../controllers/giftNurse.controller");
const { checkAuth, checkStaff, checkRole } = require("../../auth/checkAuth");
const { STAFF_POSITION, USER_ROLE } = require("../../constants/enum");
const router = express.Router();

// Bảo vệ tất cả route bằng checkAuth
router.use(checkAuth);

// ===== ADMIN ROUTES =====
// Routes cho admin quản lý gift items (system-wide)

// Gift items management (Admin only - system-wide)
router.post("/admin/gift-items", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.createGiftItem
);
router.get("/admin/gift-items", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.getGiftItems
);
router.get("/admin/gift-items/stats", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.getGiftItemsStats
);
router.get("/admin/gift-items/:giftItemId", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.getGiftItemById
);
router.patch("/admin/gift-items/:giftItemId", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.updateGiftItem
);
router.delete("/admin/gift-items/:giftItemId", 
  checkRole([USER_ROLE.ADMIN]), 
  giftManagerController.deleteGiftItem
);

// ===== MANAGER ROUTES =====
// Routes cho manager quản lý inventory, budget, packages tại cơ sở

// Gift packages management (Manager only)
router.post("/gift-packages", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.createGiftPackage
);
router.get("/gift-packages", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getGiftPackages
);
router.get("/gift-packages/:packageId", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getGiftPackageById
);
router.patch("/gift-packages/:packageId", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.updateGiftPackage
);
router.delete("/gift-packages/:packageId", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.deleteGiftPackage
);

// Inventory management (Manager only)
router.post("/inventory", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.addGiftToInventory
);
router.patch("/inventory/:inventoryId", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.updateGiftInventory
);
router.delete("/inventory/:inventoryId", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.deleteGiftInventory
);
router.get("/inventory", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getGiftInventory
);

// Budget management (Manager only)
router.post("/budget", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.manageBudget
);
router.get("/budget", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getBudget
);

// Reports and logs (Manager only)
router.get("/distributions/report", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getDistributionReport
);
router.get("/logs", 
  checkStaff([STAFF_POSITION.MANAGER]), 
  giftManagerController.getGiftLogs
);

// ===== NURSE ROUTES =====
// Routes cho nurse phân phát quà tặng

// Gift items (Read only for nurses)
router.get("/nurse/gift-items", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getGiftItems
);
router.get("/nurse/gift-items/:giftItemId", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getGiftItemById
);

// Gift packages (Read only for nurses)
router.get("/nurse/gift-packages", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getGiftPackages
);
router.get("/nurse/gift-packages/:packageId", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getGiftPackageById
);

// Inventory (Read only for nurses)
router.get("/nurse/inventory", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getGiftInventory
);

// Gift distribution (Nurse primary function)
router.get("/nurse/donations/:donationId/available-gifts", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getAvailableGiftsForDistribution
);
router.post("/nurse/distribute-package", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.distributeGiftPackage
);
router.post("/nurse/distribute", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.distributeGift
);
router.get("/nurse/distributions", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getDistributionHistory
);

// Budget (Read only for nurses)
router.get("/nurse/budget", 
  checkStaff([STAFF_POSITION.NURSE]), 
  giftNurseController.getBudget
);

// ===== SHARED ROUTES =====
// Routes có thể truy cập bởi cả manager và nurse

// Gift items (Read only for both)
router.get("/shared/gift-items", 
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), 
  giftManagerController.getGiftItems
);
router.get("/shared/gift-items/:giftItemId", 
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), 
  giftManagerController.getGiftItemById
);

// Gift packages (Read only for both, facility-specific)
router.get("/shared/gift-packages", 
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), 
  (req, res, next) => {
    // For shared routes, always filter by facility
    req.query.facilityId = req.user.facilityId;
    next();
  },
  giftManagerController.getGiftPackages
);
router.get("/shared/gift-packages/:packageId", 
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), 
  giftManagerController.getGiftPackageById
);

// Inventory (Read only for both)
router.get("/shared/inventory", 
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), 
  giftManagerController.getGiftInventory
);

// ===== ADMIN SYSTEM-WIDE ROUTES =====
// Routes cho admin xem data toàn hệ thống

// Admin can view all packages system-wide
router.get("/admin/gift-packages", 
  checkRole([USER_ROLE.ADMIN]), 
  (req, res, next) => {
    // Admin can see all packages across facilities
    // Don't set facilityId filter
    next();
  },
  giftManagerController.getGiftPackages
);
router.get("/admin/gift-packages/:packageId", 
  checkRole([USER_ROLE.ADMIN]), 
  (req, res, next) => {
    // Admin can access any package
    req.adminAccess = true;
    next();
  },
  giftManagerController.getGiftPackageById
);

module.exports = router;