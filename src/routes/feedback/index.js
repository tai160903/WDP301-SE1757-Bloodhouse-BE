const express = require("express");
const feedbackController = require("../../controllers/feedback.controller");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();

router.get("/:facilityId", feedbackController.getAllFeedback);
router.get("/details/:id", feedbackController.getFeedbackById);

router.use(checkAuth);
router.post("/", feedbackController.createFeedback);
router.put("/:id", feedbackController.updateFeedback);
router.put("/delete/:id", feedbackController.deleteFeedback);

module.exports = router;
