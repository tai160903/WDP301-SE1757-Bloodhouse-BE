const express = require("express");
const facilityStaffController = require("../../controllers/facilityStaff.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
const router = express.Router();

router.use(checkAuth);
// router.use(checkRole([USER_ROLE.ADMIN]));

router.get("/", facilityStaffController.getAllStaffs);
router.get(
  "/not-assigned",
  facilityStaffController.getAllStaffsNotAssignedToFacility
);
router.get(
  "/facility/:id",
  facilityStaffController.getFacilityStaffByFacilityId
);
router.get("/:id", facilityStaffController.getFacilityStaffById);
router.post("/", facilityStaffController.createFacilityStaff);
router.put("/:id", facilityStaffController.updateFacilityStaff);
router.put("/delete/:id", facilityStaffController.deleteFacilityStaff);
module.exports = router;
