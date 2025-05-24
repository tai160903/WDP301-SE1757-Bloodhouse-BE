"use strict";

const express = require("express");
const bloodInventoryController = require("../../controllers/bloodInventory.controller");    
const router = express.Router();

// auth routes
router.post("/", bloodInventoryController.createBloodInventory);
router.get("/", bloodInventoryController.getBloodInventory);
router.get("/facility/:facilityId", bloodInventoryController.getBloodInventoryByFacilityId);
router.get("/facility/:facilityId/available", bloodInventoryController.getBloodInventoryByFacilityIdAvailable);

module.exports = router;
