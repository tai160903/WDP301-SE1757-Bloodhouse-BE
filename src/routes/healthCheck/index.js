"use strict";

const express = require("express");
const router = express.Router();
const healthCheckController = require("../../controllers/healthCheck.controller");
const { USER_ROLE } = require("../../constants/enum");
const { checkAuth, checkRole } = require("../../auth/checkAuth");

router.use(checkAuth);
router.use(checkRole([USER_ROLE.NURSE, USER_ROLE.DOCTOR]));
router.post("/", healthCheckController.createHealthCheck);
router.patch("/:id", healthCheckController.updateHealthCheck);

module.exports = router;
