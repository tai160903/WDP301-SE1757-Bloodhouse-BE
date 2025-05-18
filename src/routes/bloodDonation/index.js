"use strict";

const express = require("express");
const bloodDonationController = require("../../controllers/bloodDonation.controller");
const router = express.Router();

// auth routes
router.post("/", bloodDonationController.createBloodDonation);
router.get("/", bloodDonationController.getBloodDonations);

module.exports = router;
