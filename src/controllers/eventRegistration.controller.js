const { OK, CREATED } = require("../configs/success.response");
const { EVENT_REGISTRATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const eventRegistrationService = require("../services/eventRegistration.service");

class EventRegistrationController {
  getAllEventRegistrationsByEventId = asyncHandler(async (req, res, next) => {
    const result = await eventRegistrationService.getAllEventRegistrationsByEventId(req.params.eventId, req.query);
    new OK({
      message: EVENT_REGISTRATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  createEventRegistration = asyncHandler(async (req, res, next) => {
    const result = await eventRegistrationService.createEventRegistration({
      userId: req.user.userId,
      eventId: req.params.eventId,
    });
    new CREATED({
      message: EVENT_REGISTRATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  
}

module.exports = new EventRegistrationController();
