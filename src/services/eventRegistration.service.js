"use strict";

const {
  EVENT_REGISTRATION_MESSAGE,
  EVENT_MESSAGE,
} = require("../constants/message");
const eventModel = require("../models/event.model");
const eventRegistrationModel = require("../models/eventRegistration.model");
const { NotFoundError, BadRequestError } = require("../configs/error.response");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const mongoose = require("mongoose");

class EventRegistrationService {
  createEventRegistration = async ({ eventId, userId }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const event = await eventModel.findById(eventId);
      if (!event) {
        throw new NotFoundError(EVENT_MESSAGE.EVENT_NOT_FOUND);
      }
      const eventRegistration = await eventRegistrationModel.findOne({
        eventId,
        userId,
      });
      if (eventRegistration) {
        throw new BadRequestError(
          EVENT_REGISTRATION_MESSAGE.EVENT_ALREADY_REGISTERED
        );
      }

      const newEventRegistration = await eventRegistrationModel.create(
        [
          {
            eventId,
            userId,
          },
        ],
        { session }
      );

      event.registeredParticipants = (event.registeredParticipants || 0) + 1;
      await event.save({ session });

      await session.commitTransaction();
      return newEventRegistration[0];
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  getAllEventRegistrationsByEventId = async (
    eventId,
    { limit = 10, page = 1, status }
  ) => {
    let query = { eventId };
    if (status) query.status = status;
    const result = await getPaginatedData({
      model: eventRegistrationModel,
      query,
      page,
      limit,
      populate: [
        { path: "userId", select: "username avatar fullName" },
        { path: "eventId", select: "title" },
      ],
    });
    return result;
  };
}

module.exports = new EventRegistrationService();
