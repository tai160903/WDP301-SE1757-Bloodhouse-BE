"use strict";

const express = require("express");
const bloodDonationController = require("../../controllers/bloodDonation.controller");
const router = express.Router();
const checkAuth = require("../../middlewares/checkAuth");
// auth routes
router.use(checkAuth);
router.post("/registrations", bloodDonationController.createBloodDonationRegistration);

router.get("/registrations", bloodDonationController.getBloodDonationRegistrations);

router.put("/registrations/:id", bloodDonationController.approveBloodDonationRegistration);
router.get("/donations", bloodDonationController.getUserDonations);

router.post("/create-donation", bloodDonationController.createBloodDonation);
router.get("/donations", bloodDonationController.getBloodDonations);

module.exports = router;
