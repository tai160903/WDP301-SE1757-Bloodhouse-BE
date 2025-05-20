"use strict";

const express = require("express");
const router = express.Router();
const bloodDonationController = require("../../controllers/bloodDonation.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
// auth routes
router.use(checkAuth);
router.get("/user", bloodDonationController.getUserDonations);
router.get("/:id", bloodDonationController.getBloodDonationDetail);

router.use(checkRole([, USER_ROLE.MANAGER]));

router.post("/", bloodDonationController.createBloodDonation);

router.get("/", bloodDonationController.getBloodDonations);



module.exports = router;
