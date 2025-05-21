const { OK, CREATED } = require("../configs/success.response");
const { FEEDBACK_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const feedbackService = require("../services/feedback.service");

class FeedbackController {
  getAllFeedback = asyncHandler(async (req, res) => {
    const { facilityId } = req.params;

    const result = await feedbackService.getAllFeedback(facilityId);
    new OK({
      message: FEEDBACK_MESSAGE.GET_ALL_FEEDBACK_SUCCESS,
      data: result,
    }).send(res);
  });

  getFeedbackById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await feedbackService.getFeedbackById(id);
    new OK({
      message: FEEDBACK_MESSAGE.GET_FEEDBACK_BY_ID_SUCCESS,
      data: result,
    }).send(res);
  });

  createFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.createFeedback(req.body);
    new CREATED({
      message: FEEDBACK_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  updateFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const result = await feedbackService.updateFeedback(id, body);
    new OK({
      message: FEEDBACK_MESSAGE.UPDATE_FEEDBACK_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const result = await feedbackService.deleteFeedback(id, userId);
    new OK({
      message: FEEDBACK_MESSAGE.DELETE_FEEDBACK_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new FeedbackController();
