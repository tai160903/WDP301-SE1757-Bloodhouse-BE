"use strict";

const express = require("express");
const router = express.Router();
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");
const bloodDeliveryController = require("../../controllers/bloodDelivery.controller");

// auth routes
router.use(checkAuth);

// User accessible routes
router.get(
  "/request/:requestId",
  bloodDeliveryController.getBloodDeliveryByRequestId
);

router.get("/:deliveryId", bloodDeliveryController.getBloodDeliveryById);

// Staff routes - require staff role
router.use(checkRole([USER_ROLE.TRANSPORTER]));
router.get(
  "/all/transporter/facility/:facilityId",
  bloodDeliveryController.getAllBloodDeliveriesByTransporterId
);

router.get(
  "/:deliveryId/facility/:facilityId",
  bloodDeliveryController.getBloodDeliveryByIdAndFacilityId
);

router.put(
  "/:deliveryId/start/facility/:facilityId",
  bloodDeliveryController.startDelivery
);

router.put(
  "/:deliveryId/complete",
  bloodDeliveryController.completeDelivery
);

module.exports = router;
