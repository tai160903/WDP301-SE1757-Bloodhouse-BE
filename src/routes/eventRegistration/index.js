const express = require("express");
const eventRegistrationController = require("../../controllers/eventRegistration.controller");
const { checkRole, checkAuth } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

const router = express.Router();

router.get("/event/:eventId", eventRegistrationController.getAllEventRegistrationsByEventId);

router.use(checkAuth);
router.use(checkRole([USER_ROLE.MEMBER]));
router.post("/event/:eventId", eventRegistrationController.createEventRegistration);
// router.put("/:id", eventRegistrationController.updateEventRegistration);
// router.delete("/:id", eventRegistrationController.deleteEventRegistration);

module.exports = router;
