const express = require("express");
const facilityController = require("../../controllers/facility.controller");
const { checkRole } = require("../auth/checkAuth");
const { USER_ROLE } = require("../constants/enum");

const router = express.Router();

router.get("/", facilityController.getAllFacilities);
router.get("/:id", facilityController.getFacilityById);

router.use(checkRole(USER_ROLE.STAFF, USER_ROLE.ADMIN));
router.post("/", facilityController.createFacility);
router.put("/:id", facilityController.updateFacility);
router.put("delete/:id", facilityController.deleteFacility);

module.exports = router;
