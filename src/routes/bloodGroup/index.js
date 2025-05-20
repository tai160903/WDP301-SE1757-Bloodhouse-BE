"use strict";

const express = require("express");
const bloodGroupController = require("../../controllers/bloodGroup.controller");    
const router = express.Router();

// auth routes
router.post("/", bloodGroupController.createBloodGroup);
router.get("/", bloodGroupController.getBloodGroups);
router.get("/positive", bloodGroupController.getBloodGroupPositive);
router.put("/:id", bloodGroupController.updateBloodGroup);

module.exports = router;
