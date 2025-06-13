const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const eventController = require("../../controllers/event.controller");
const { checkRole, checkAuth } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

const router = express.Router();

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);


router.use(checkAuth);
router.use(checkRole([USER_ROLE.MANAGER]));
router.get("/facility/:facilityId", eventController.getAllEventsByFacilityId);
router.post("/", upload.single("file"), eventController.createEvent);

module.exports = router;
