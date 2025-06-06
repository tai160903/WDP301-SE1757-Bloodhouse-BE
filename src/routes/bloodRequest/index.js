"use strict";

const express = require("express");
const router = express.Router();
const BloodRequestController = require("../../controllers/bloodRequest.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { upload } = require("../../utils/upload");
const { USER_ROLE } = require("../../constants/enum");


router.use(checkAuth)
router.post("/", upload.array("medicalDocuments"), BloodRequestController.createBloodRequest);
router.get("/user", BloodRequestController.getUserBloodRequests);
router.get("/user/:id", BloodRequestController.getUserBloodRequestDetails);
router.get("/need-support", BloodRequestController.getRequestBloodNeedSupport);
router.get("/need-support/:id", BloodRequestController.getRequestBloodNeedSupportById);

router.use(checkRole([USER_ROLE.MANAGER]))
router.post("/:id/assign-blood-units", BloodRequestController.assignBloodUnitsToRequest);

router.use(checkRole([USER_ROLE.NURSE]))
router.get("/facility/:facilityId/support-requests", BloodRequestController.getSupportRequestsForFacility);
router.get("/facility/:facilityId/support-requests/:id", BloodRequestController.getSupportRequestDetails);
router.get("/facility/:facilityId", BloodRequestController.getFacilityBloodRequests);
router.get(
  "/facility/:facilityId/user/:userId",
  BloodRequestController.getFacilityBloodRequestsByUser
);
router.get("/facility/:facilityId/:id", BloodRequestController.getFacilityBloodRequestDetails);
router.patch("/facility/:facilityId/:id/status", BloodRequestController.updateBloodRequestStatus);
router.patch("/facility/:facilityId/:id/component", BloodRequestController.updateBloodRequestComponent);

module.exports = router;