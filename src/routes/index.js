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
router.use("/blood-donations", require("./bloodDonation"));
router.use("/content-category", require("./contentCategory"));
router.use("/content", require("./content"));
router.use("/facility", require("./facility"));
router.use("/blood-request", require("./bloodRequest"));
router.use("/facility-staff", require("./facilityStaff"));
router.use("/feedback", require("./feedback"));
router.use("/blood-inventory", require("./bloodInventory"));
router.use("/health-check", require("./healthCheck"));
router.use("/process-donation-log", require("./processDonationLog"));

module.exports = router;
