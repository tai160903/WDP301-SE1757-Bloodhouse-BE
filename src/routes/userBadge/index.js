const express = require("express");
const { checkAuth } = require("../../auth/checkAuth");
const userBadgeController = require("../../controllers/userBadge.controller");
const router = express.Router();

router.use(checkAuth);
router.get("/user", userBadgeController.getUserBadges);

module.exports = router;
