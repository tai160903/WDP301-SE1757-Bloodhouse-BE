"use strict";

const express = require("express");
const router = express.Router();
const bloodDonationRegistrationController = require("../../controllers/bloodDonationRegistration.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

// auth routes
router.use(checkAuth);

// Public routes for authenticated users
router.post(
  "/",
  checkRole([USER_ROLE.MEMBER]),
  bloodDonationRegistrationController.createBloodDonationRegistration
);

router.get(
  "/",
  bloodDonationRegistrationController.getBloodDonationRegistrations
);

router.get(
  "/user",
  bloodDonationRegistrationController.getUserBloodDonationRegistrations
);

router.get(
  "/:id",
  bloodDonationRegistrationController.getBloodDonationRegistrationDetail
);

// Staff routes - require staff role
router.use(checkRole([USER_ROLE.MANAGER, USER_ROLE.NURSE, USER_ROLE.DOCTOR]));

// Routes for all staff
router.get(
  "/staff/assigned",
  bloodDonationRegistrationController.getStaffAssignedRegistrations
);

router.post(
  "/check-in",
  checkStaff([STAFF_POSITION.NURSE, STAFF_POSITION.MANAGER]),
  bloodDonationRegistrationController.updateCheckInStatus
);

// Doctor QR scan to get health check details
router.post(
  "/doctor/qr-scan",
  checkStaff([STAFF_POSITION.DOCTOR]),
  bloodDonationRegistrationController.processDoctorQRScan
);

// Nurse smart scan - comprehensive QR analysis for nurse workflow
router.post(
  "/nurse/smart-scan",
  checkStaff([STAFF_POSITION.NURSE]),
  bloodDonationRegistrationController.processNurseSmartScan
);

// Manager-only routes
router.get(
  "/facility/all",
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]),
  bloodDonationRegistrationController.getFacilityRegistrations
);

router.get(
  "/facility/statistics",
  checkStaff([STAFF_POSITION.MANAGER]),
  bloodDonationRegistrationController.getRegistrationStatistics
);

// Routes requiring manager/nurse role for registration updates
router.put(
  "/:id",
  checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]),
  bloodDonationRegistrationController.updateBloodDonationRegistration
);

module.exports = router;
