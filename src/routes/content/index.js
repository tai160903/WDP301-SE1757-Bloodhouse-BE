"use strict"

const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const contentController = require("../../controllers/content.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

router.get("/", contentController.getContents);
router.get("/:id", contentController.getContentById);

router.use(checkAuth);
router.use(checkRole([USER_ROLE.ADMIN]));
router.post("/", upload.single("image"), contentController.createContent);
router.put("/:id", upload.single("image"), contentController.updateContent);

module.exports = router;
