"use strict";

const { EVENT_STATUS } = require("../constants/enum");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const eventModel = require("../models/event.model");
const facilityModel = require("../models/facility.model");

class EventService {
  createEvent = async ({
    facilityId,
    title,
    description,
    startTime,
    endTime,
    address,
    latitude,
    longitude,
    contactPhone,
    contactEmail,
    expectedParticipants,
    userId,
    isPublic,
    file,
  }) => {
    // 1. Upload ảnh nếu có

    const facility = await facilityModel.findById(facilityId);
    if (!facility) {
      throw new Error("Facility not found");
    }

    if (!title) {
      throw new Error("Title is required");
    }

    if (!description) {
      throw new Error("Description is required");
    }

    if (!startTime) {
      throw new Error("Start time is required");
    }

    if (!endTime) {
      throw new Error("End time is required");
    }

    if (!address) {
      throw new Error("Address is required");
    }

    if (!latitude) {
      throw new Error("Latitude is required");
    }

    if (!longitude) {
      throw new Error("Longitude is required");
    }

    if (!expectedParticipants) {
      throw new Error("Expected participants is required");
    }

    if (!contactPhone) {
      throw new Error("Contact phone is required");
    }

    if (!contactEmail) {
      throw new Error("Contact email is required");
    }

    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "event" });
      image = result.url;
    }

    const event = await eventModel.create({
      facilityId,
      title,
      description,
      bannerUrl: image,
      startTime,
      endTime,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      status: EVENT_STATUS.DRAFT,
      contactPhone,
      contactEmail,
      expectedParticipants,
      createdBy: userId,
      isPublic,
    });

    return event;
  };

  getAllEvents = async ({ status, limit = 10, page = 1 }) => {
    const query = {
      isPublic: true,
    };
    if (status) query.status = status;
    const result = await getPaginatedData({
      model: eventModel,
      query,
      page,
      limit,
      select:
        "_id title description bannerUrl startTime endTime address location status contactPhone contactEmail expectedParticipants createdBy isPublic",
      populate: [
        { path: "facilityId", select: "name" },
        { path: "createdBy", select: "username avatar fullName" },
        { path: "registeredParticipants", select: "username avatar fullName" },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  getEventById = async (id) => {
    const event = await eventModel.findById(id).populate([
      {
        path: "facilityId",
        select: "name",
      },
      {
        path: "createdBy",
        select: "username avatar fullName",
      },
      {
        path: "registeredParticipants",
        select: "username avatar fullName",
      },
    ]);
    return event;
  };

  getAllEventsByFacilityId = async (facilityId) => {
    const events = await eventModel.find({ facilityId });
    return events;
  };
}

module.exports = new EventService();
