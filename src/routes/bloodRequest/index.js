"use strict";

const express = require("express");
const router = express.Router();
const BloodRequestController = require("../../controllers/bloodRequest.controller");
const { checkAuth } = require("../../auth/checkAuth");
const { upload } = require("../../utils/upload");


router.use(checkAuth)
router.post("/", upload.array('medicalDocuments', 5), BloodRequestController.createBloodRequest);


module.exports = router;