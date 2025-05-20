"use strict"

const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const contentController = require("../../controllers/content.controller");

router.post("/", upload.single("image"), contentController.createContent);
router.get("/", contentController.getContents);
router.get("/:id", contentController.getContentById);
router.put("/:id", upload.single("image"), contentController.updateContent);

module.exports = router;
