const { BadRequestError } = require("../configs/error.response");
const feedbackModel = require("../models/feedback.model");

class FeedbackService {
  getAllFeedback = async ({ facilityId }) => {
    const feedback = await feedbackModel
      .find({ facilityId, isDeleted: false })
      .populate("userId", "name email")
      .populate("facilityId", "name address");

    if (!feedback) {
      throw new BadRequestError("Feedback not found");
    }
    return {
      count: feedback.length,
      feedback,
    };
  };

  getFeedbackById = async (id) => {
    const feedback = await feedbackModel.findById(id);
    if (!feedback) {
      throw new BadRequestError("Feedback not found");
    }
    return feedback;
  };

  createFeedback = async (body) => {
    const { userId, facilityId, rating, comment } = body;
    if (!userId || !facilityId || !rating) {
      throw new BadRequestError(
        "User ID, Facility ID, and Rating are required"
      );
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
      throw new BadRequestError("Feedback not updated");
    }
    return feedback;
  };

  deleteFeedback = async (id) => {
    const feedback = await feedbackModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!feedback) {
      throw new BadRequestError("Feedback not deleted");
    }
    return feedback;
  };
}
module.exports = new FeedbackService();
