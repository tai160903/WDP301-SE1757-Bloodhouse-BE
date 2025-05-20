const express = require("express");
const feedbackController = require("../../controllers/feedback.controller");

const router = express.Router();

router.get("/", feedbackController.getAllFeedbacks);
router.get("/:id", feedbackController.getFeedbackById);
router.post("/", feedbackController.createFeedback);
