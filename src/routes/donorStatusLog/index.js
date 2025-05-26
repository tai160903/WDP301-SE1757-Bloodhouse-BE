"use strict";

const express = require("express");
const router = express.Router();
const donorStatusLogController = require("../../controllers/donorStatusLog.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

// All routes require authentication
router.use(checkAuth);

// Staff only routes (nurses, doctors, managers)
router.use(checkRole([USER_ROLE.NURSE, USER_ROLE.DOCTOR, USER_ROLE.MANAGER]));

// Create donor status log
router.post("/", donorStatusLogController.createDonorStatusLog);

// Get donor status logs by donation ID
router.get("/donation/:donationId", donorStatusLogController.getDonorStatusLogsByDonation);

// Get donor status logs by user ID  
router.get("/user/:userId", donorStatusLogController.getDonorStatusLogsByUser);

// Get donor status log detail
router.get("/:id", donorStatusLogController.getDonorStatusLogDetail);

// Transition to resting phase
router.patch("/:id", donorStatusLogController.updateDonorStatusLog);

module.exports = router; 