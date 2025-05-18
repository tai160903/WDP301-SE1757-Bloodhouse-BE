"use strict";

const express = require("express");
const router = express.Router();
const bloodDonationRegistrationController = require("../../controllers/bloodDonationRegistration.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
// auth routes
router.use(checkAuth);
router.post("/", bloodDonationRegistrationController.createBloodDonationRegistration);

router.get("/", bloodDonationRegistrationController.getBloodDonationRegistrations);

router.get("/user", bloodDonationRegistrationController.getUserBloodDonationRegistrations);

router.get("/:id", bloodDonationRegistrationController.getBloodDonationRegistrationDetail);

router.use(checkRole([USER_ROLE.STAFF, USER_ROLE.MANAGER]));

router.put("/:id", bloodDonationRegistrationController.approveBloodDonationRegistration);


module.exports = router;
