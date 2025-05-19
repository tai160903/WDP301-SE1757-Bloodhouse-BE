"use strict";

const express = require("express");
const bloodCompatibilityController = require("../../controllers/bloodCompatibility.controller");
const router = express.Router();

// auth routes
router.post("/", bloodCompatibilityController.createBloodCompatibility);
router.get("/", bloodCompatibilityController.getBloodCompatibilities);

module.exports = router;
