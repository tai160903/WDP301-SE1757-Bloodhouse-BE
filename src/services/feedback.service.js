const { BadRequestError } = require("../configs/error.response");
const { FEEDBACK_MESSAGE } = require("../constants/message");
const feedbackModel = require("../models/feedback.model");

class FeedbackService {
  getAllFeedback = async ({ facilityId }) => {
    const feedback = await feedbackModel
      .find({ facilityId, isDeleted: false })
      .populate("userId", "name email")
      .populate("facilityId", "name address");

    if (!feedback) {
      throw new BadRequestError(FEEDBACK_MESSAGE.FEEDBACK_NOT_FOUND);
    }
    return {
      count: feedback.length,
      feedback,
    };
  };

  getFeedbackById = async (id) => {
    const feedback = await feedbackModel.findById(id);
    if (!feedback) {
      throw new BadRequestError(FEEDBACK_MESSAGE.FEEDBACK_NOT_FOUND);
    }
    return feedback;
  };

  createFeedback = async (body) => {
    const { userId, facilityId, rating, comment } = body;
    if (!userId || !facilityId || !rating) {
      throw new BadRequestError(FEEDBACK_MESSAGE.CREATE_FAILED);
    }
    const feedback = await feedbackModel.create({
      userId,
      facilityId,
      rating,
      comment,
    });

    return feedback;
  };

  updateFeedback = async (id, body) => {
    const feedback = await feedbackModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!feedback) {
      throw new BadRequestError(FEEDBACK_MESSAGE.UPDATE_FEEDBACK_FAILED);
    }
    return feedback;
  };

  deleteFeedback = async (id) => {
    const feedback = await feedbackModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!feedback) {
      throw new BadRequestError(FEEDBACK_MESSAGE.DELETE_FEEDBACK_FAILED);
    }
    return feedback;
  };
}

module.exports = new FeedbackService();
