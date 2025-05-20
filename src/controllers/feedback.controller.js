const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const feedbackService = require("../services/feedback.service");

class FeedbackController {
  getAllFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.getAllFeedback(req.params);
    new OK({
      message: "Feedback retrieved successfully",
      data: result,
    });
  });

  getFeedbackById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await feedbackService.getFeedbackById(id);
    new OK({
      message: "Feedback retrieved successfully",
      data: result,
    });
  });

  createFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.createFeedback(req.body);
    new CREATED({
      message: "Feedback created successfully",
      data: result,
    });
  });

  updateFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await feedbackService.updateFeedback(id, body);
    new OK({
      message: "Feedback updated successfully",
      data: result,
    });
  });

  deleteFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await feedbackService.deleteFeedback(id);
    new OK({
      message: "Feedback deleted successfully",
      data: result,
    });
  });
}

module.exports = new FeedbackController();
