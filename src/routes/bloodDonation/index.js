"use strict";

const express = require("express");
const router = express.Router();
const bloodDonationController = require("../../controllers/bloodDonation.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

// auth routes
router.use(checkAuth);

// User accessible routes
router.get("/user", bloodDonationController.getUserDonations);

// Staff routes - require staff role
router.use(checkRole([USER_ROLE.NURSE, USER_ROLE.DOCTOR, USER_ROLE.MANAGER]));

router.get("/", bloodDonationController.getBloodDonations);
router.post("/",checkStaff([STAFF_POSITION.NURSE]), bloodDonationController.createBloodDonation);
router.patch("/:id", checkStaff([STAFF_POSITION.NURSE]), bloodDonationController.updateBloodDonation);
router.patch("/transition-to-resting/:registrationId", bloodDonationController.transitionToResting);

// New routes for health check and doctor
router.get("/health-check/:healthCheckId", bloodDonationController.getBloodDonationByHealthCheckId);
router.get("/doctor/", checkStaff([STAFF_POSITION.DOCTOR]), bloodDonationController.getBloodDonationsByDoctorId);

router.get("/:id", bloodDonationController.getBloodDonationDetail);

module.exports = router;
