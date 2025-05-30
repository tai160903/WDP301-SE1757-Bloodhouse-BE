"use strict";

const express = require("express");
const router = express.Router();
const BloodRequestSupportController = require("../../controllers/bloodRequestSupport.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);
router.post("/", BloodRequestSupportController.createBloodRequestSupport);
router.get("/", BloodRequestSupportController.getBloodRequestSupports);
router.get(
  "/:requestId",
  BloodRequestSupportController.getBloodRequestSupportsByRequestId
);

router.use(checkRole([USER_ROLE.MANAGER]));
router.patch(
  "/:requestId/status",
  BloodRequestSupportController.updateBloodRequestSupportStatus
);

module.exports = router;
