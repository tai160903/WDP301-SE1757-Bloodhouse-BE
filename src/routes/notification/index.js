const express = require("express");
const { checkAuth } = require("../../auth/checkAuth");
const notificationController = require("../../controllers/notification.controller");
const router = express.Router();

router.use(checkAuth);
router.get("/user", notificationController.getNotificationUser);

module.exports = router;
