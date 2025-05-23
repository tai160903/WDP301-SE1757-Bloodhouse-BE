"use strict";

const express = require("express");
const router = express.Router();
const bloodDonationRegistrationController = require("../../controllers/bloodDonationRegistration.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");
// auth routes
router.use(checkAuth);
router.post(
  "/",
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

router.use(checkRole([USER_ROLE.MANAGER, USER_ROLE.NURSE]));

router.put(
  "/:id", checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]),
  bloodDonationRegistrationController.updateBloodDonationRegistration
);

module.exports = router;
