const { OK, CREATED } = require("../configs/success.response");
const { EVENT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const eventService = require("../services/event.service");

class EventController {
  getAllEvents = asyncHandler(async (req, res, next) => {
    const result = await eventService.getAllEvents(req.query);
    new OK({
      message: EVENT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getEventById = asyncHandler(async (req, res, next) => {
    const result = await eventService.getEventById(req.params.id);
    new OK({
      message: EVENT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllEventsByFacilityId = asyncHandler(async (req, res, next) => {
    const result = await eventService.getAllEventsByFacilityId(
      req.params.facilityId
    );
    new OK({
      message: EVENT_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  createEvent = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;

    const result = await eventService.createEvent({
      ...req.body,
      userId,
      file: req.file,
    });
    new CREATED({
      message: EVENT_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new EventController();
