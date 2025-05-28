"use strict";

const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/blood-component", require("./bloodComponent"));
router.use("/blood-group", require("./bloodGroup"));
router.use("/blood-compatibility", require("./bloodCompatibility"));
router.use("/user", require("./user"));
router.use(
  "/blood-donation-registration",
  require("./bloodDonationRegistration")
);
router.use("/blood-donation", require("./bloodDonation"));
router.use("/blood-unit", require("./bloodUnit"));
router.use("/content-category", require("./contentCategory"));
router.use("/content", require("./content"));
router.use("/facility", require("./facility"));
router.use("/blood-request", require("./bloodRequest"));
router.use("/facility-staff", require("./facilityStaff"));
router.use("/feedback", require("./feedback"));
router.use("/blood-inventory", require("./bloodInventory"));
router.use("/notification", require("./notification"));
router.use("/health-check", require("./healthCheck"));
router.use("/process-donation-log", require("./processDonationLog"));
router.use("/donor-status-log", require("./donorStatusLog"));
router.use("/blood-request-support", require("./bloodRequestSupport"));

module.exports = router;
