"use strict";

const express = require("express");
const router = express.Router();
const bloodInventoryController = require("../../controllers/bloodInventory.controller");    
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

// All routes require authentication
router.use(checkAuth);

// Staff routes  
router.use(checkRole([USER_ROLE.MANAGER, USER_ROLE.DOCTOR, USER_ROLE.NURSE]));

// Basic inventory routes
router.get("/", bloodInventoryController.getBloodInventory);
router.get("/facility/:facilityId/available", bloodInventoryController.getBloodInventoryByFacilityIdAvailable);

// Detailed inventory management routes  
router.get("/facility/:facilityId", bloodInventoryController.getInventoryByFacility);
router.get("/detail/:id", bloodInventoryController.getInventoryDetail);

// Manager only routes
router.use(checkStaff([STAFF_POSITION.MANAGER]));

router.post("/", bloodInventoryController.createBloodInventory);
router.get("/facility/:facilityId/statistics", bloodInventoryController.getInventoryStatistics);
router.get("/facility/:facilityId/expiring", bloodInventoryController.getExpiringUnits);
router.patch("/facility/:facilityId/update-expired", bloodInventoryController.updateExpiredUnits);
router.post("/facility/:facilityId/reserve", bloodInventoryController.reserveUnits);

module.exports = router;
