const express = require("express");
const facilityController = require("../../controllers/facility.controller");

const router = express.Router();

router.get("/", facilityController.getAllFacilities);
router.get("/:id", facilityController.getFacilityById);

router.post("/", facilityController.createFacility);

router.put("/:id", facilityController.updateFacility);
router.put("delete/:id", facilityController.deleteFacility);

module.exports = router;
