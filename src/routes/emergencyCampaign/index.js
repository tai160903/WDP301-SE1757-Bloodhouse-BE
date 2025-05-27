const express = require("express");
const { checkRole, checkAuth } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
const emergencyCampaignController = require("../../controllers/emergencyCampaign.controller");

const router = express.Router();

router.use(checkAuth);
router.get("/", emergencyCampaignController.getAllEmergencyCampaigns);
router.get("/:id", emergencyCampaignController.getEmergencyCampaignById);
router.get("/facility/:id", emergencyCampaignController.getFacilityEmergencyCampaigns);

router.use(checkRole([USER_ROLE.MANAGER]));
router.post("/", emergencyCampaignController.createEmergencyCampaign);

module.exports = router;
