"use strict"

const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const contentController = require("../../controllers/content.controller");
const { checkAuth, checkRole, checkStaff } = require("../../auth/checkAuth");
const { USER_ROLE, STAFF_POSITION } = require("../../constants/enum");

const router = express.Router();

// Public routes - Không cần authentication
router.get("/public", contentController.getAllPublishedContents); // Tất cả content published (system + facility)
router.get("/system", contentController.getSystemContents); // Chỉ content hệ thống
router.get("/public/:id", contentController.getContentById);

// Protected routes - Cần authentication
router.use(checkAuth);

// Admin routes - Quản lý content toàn hệ thống
router.post("/admin", checkRole([USER_ROLE.ADMIN]), upload.single("image"), contentController.createContent);
router.get("/admin", checkRole([USER_ROLE.ADMIN]), contentController.getContents);
router.get("/admin/stats", checkRole([USER_ROLE.ADMIN]), contentController.getContentStats);
router.put("/admin/:id", checkRole([USER_ROLE.ADMIN]), upload.single("image"), contentController.updateContent);
router.delete("/admin/:id", checkRole([USER_ROLE.ADMIN]), contentController.deleteContent);

// Facility routes - Manager quản lý content facility
router.post("/facility", checkStaff([STAFF_POSITION.MANAGER]), upload.single("image"), contentController.createContent);
router.get("/facility", checkStaff([STAFF_POSITION.MANAGER, STAFF_POSITION.NURSE]), contentController.getContents);
router.get("/facility/stats", checkStaff([STAFF_POSITION.MANAGER]), contentController.getContentStats);
router.get("/facility/:facilityId", checkStaff([STAFF_POSITION.MANAGER]), contentController.getFacilityContents);
router.put("/facility/:id", checkStaff([STAFF_POSITION.MANAGER]), upload.single("image"), contentController.updateContent);
router.delete("/facility/:id", checkStaff([STAFF_POSITION.MANAGER]), contentController.deleteContent);

// Common routes - Xem content cụ thể
router.get("/:id", contentController.getContentById);

module.exports = router;
