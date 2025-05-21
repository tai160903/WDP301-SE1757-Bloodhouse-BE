const { BadRequestError } = require("../configs/error.response");
const {
  FEEDBACK_MESSAGE,
  FACILITY_MESSAGE,
  USER_MESSAGE,
} = require("../constants/message");
const feedbackModel = require("../models/feedback.model");
const facilityModel = require("../models/facility.model");
const userModel = require("../models/user.model");

class FeedbackService {
  getAllFeedback = async (facilityId) => {
    try {
      const checkFacility = await facilityModel.findById(facilityId);
      if (!checkFacility) {
        throw new BadRequestError(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
      }
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
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };

  getFeedbackById = async (id) => {
    try {
      const feedback = await feedbackModel
        .findById(id)
        .populate("userId", "fullName email")
        .populate("facilityId", "name address");
      if (!feedback) {
        throw new BadRequestError(FEEDBACK_MESSAGE.FEEDBACK_NOT_FOUND);
      }
      return feedback;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };

  createFeedback = async (body) => {
    try {
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
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };

  updateFeedback = async (id, body) => {
    try {
      const { userId } = body;

      const checkFeedback = await feedbackModel.findById(id);
      if (userId !== checkFeedback.userId.toString()) {
        throw new BadRequestError(FEEDBACK_MESSAGE.NOT_AUTHORIZED);
      }

      const feedback = await feedbackModel.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!feedback) {
        throw new BadRequestError(FEEDBACK_MESSAGE.UPDATE_FEEDBACK_FAILED);
      }
      return feedback;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };

  deleteFeedback = async (id, userId) => {
    try {
      const checkUser = await userModel.findById(userId);
      console.log(checkUser);
      const checkFeedback = await feedbackModel.findById(id);

      if (!checkUser) {
        throw new BadRequestError(USER_MESSAGE.USER_NOT_FOUND);
      }

      if (
        !checkUser.role.includes("ADMIN") &&
        userId !== checkFeedback.userId.toString()
      ) {
        throw new BadRequestError(FEEDBACK_MESSAGE.NOT_AUTHORIZED);
      }

      const feedback = await feedbackModel.findByIdAndUpdate(id, {
        $set: {
          isDeleted: true,
        },
      });

      if (!feedback) {
        throw new BadRequestError(FEEDBACK_MESSAGE.DELETE_FEEDBACK_FAILED);
      }

      return feedback;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };
}

module.exports = new FeedbackService();
