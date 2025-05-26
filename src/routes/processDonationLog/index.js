"use strict";

const express = require("express");
const router = express.Router();
const processDonationLogController = require("../../controllers/processDonationLog.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

// Authentication required for all routes
router.use(checkAuth);

// All process donation log routes require staff role
router.use(checkRole([USER_ROLE.MANAGER, USER_ROLE.NURSE, USER_ROLE.DOCTOR]));

// Routes accessible by all staff
router.get("/", processDonationLogController.getProcessDonationLogs);
router.get("/registration/:registrationId", processDonationLogController.getLogsByRegistrationId);
router.get("/staff/my-logs", processDonationLogController.getLogsByStaff);
router.get("/:logId", processDonationLogController.getLogById);

// Routes requiring specific staff positions
router.use(checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE, STAFF_POSITION.DOCTOR]));
router.post("/", processDonationLogController.createProcessDonationLog);

module.exports = router; 