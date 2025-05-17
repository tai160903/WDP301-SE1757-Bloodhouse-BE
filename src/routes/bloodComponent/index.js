"use strict";

const express = require("express");
const bloodComponentController = require("../../controllers/bloodComponent.controller");
const router = express.Router();

// auth routes
router.post("/", bloodComponentController.createBloodComponent);
router.get("/", bloodComponentController.getBloodComponents);
router.put("/:id", bloodComponentController.updateBloodComponent);

module.exports = router;
