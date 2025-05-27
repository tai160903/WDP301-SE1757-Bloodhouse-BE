"use strict";

const express = require("express");
const router = express.Router();
const healthCheckController = require("../../controllers/healthCheck.controller");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");

// Auth middleware
router.use(checkAuth);

// Routes cho nurse và doctor
router.post("/", checkRole([USER_ROLE.NURSE]), checkStaff([STAFF_POSITION.NURSE]), healthCheckController.createHealthCheck);
router.patch("/:id", checkRole([USER_ROLE.DOCTOR]), checkStaff([STAFF_POSITION.DOCTOR]), healthCheckController.updateHealthCheck);

// Routes cho nurse
router.get("/nurse", checkRole([USER_ROLE.NURSE]), checkStaff([STAFF_POSITION.NURSE]), healthCheckController.getNurseHealthChecks);

// Route mới: Lấy health check detail theo registration ID
router.get("/registration/:registrationId", checkRole([USER_ROLE.NURSE, USER_ROLE.DOCTOR, USER_ROLE.MANAGER]), healthCheckController.getHealthCheckByRegistrationId);

// Routes cho facility
router.get("/facility", checkRole([USER_ROLE.MANAGER]), checkStaff([STAFF_POSITION.MANAGER]), healthCheckController.getFacilityHealthChecks);

// Routes cho doctor
router.get("/doctor", checkRole([USER_ROLE.DOCTOR]), checkStaff([STAFF_POSITION.DOCTOR]), healthCheckController.getDoctorHealthChecks);

// Routes cho user
router.get("/user", checkRole([USER_ROLE.MEMBER]), healthCheckController.getUserHealthChecks);

// Route chi tiết (có thể truy cập bởi user, doctor, nurse, manager)
router.get("/:id", checkRole([USER_ROLE.MEMBER, USER_ROLE.DOCTOR, USER_ROLE.NURSE, USER_ROLE.MANAGER]), healthCheckController.getHealthCheckDetail);

module.exports = router;
