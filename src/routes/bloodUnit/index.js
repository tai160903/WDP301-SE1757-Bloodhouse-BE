"use strict";

const express = require("express");
const router = express.Router();
const bloodUnitController = require("../../controllers/bloodUnit.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

// All routes require authentication
router.use(checkAuth);

// Staff routes
router.use(checkRole([USER_ROLE.DOCTOR, USER_ROLE.NURSE, USER_ROLE.MANAGER]));

// Get blood units by donation (accessible by all staff)
router.get("/donation/:donationId", bloodUnitController.getBloodUnitsByDonation);

// Get blood unit detail (accessible by all staff)
router.get("/:id", bloodUnitController.getBloodUnitDetail);

// Doctor only routes
router.post("/", checkStaff([STAFF_POSITION.DOCTOR]), bloodUnitController.createBloodUnitsFromDonation);
router.patch("/:id", checkStaff([STAFF_POSITION.DOCTOR]), bloodUnitController.updateBloodUnit);

// Get blood units processed by current doctor
router.get("/processed-by/me", checkStaff([STAFF_POSITION.DOCTOR]), bloodUnitController.getBloodUnitsByProcessedBy);

// Manager routes
router.use(checkStaff([STAFF_POSITION.MANAGER]));

// Get blood units by facility (Manager)
router.get("/facility/:facilityId", bloodUnitController.getBloodUnitsByFacility);

// Get blood units statistics (Manager)
router.get("/facility/:facilityId/statistics", bloodUnitController.getBloodUnitsStatistics);

module.exports = router; 