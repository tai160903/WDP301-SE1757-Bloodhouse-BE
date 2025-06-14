"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { CONTENT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const contentService = require("../services/content.service");

class ContentController {
  createContent = asyncHandler(async (req, res, next) => {
    const result = await contentService.createContent(req.body, req.file, req.user);
    new CREATED({ message: CONTENT_MESSAGE.CREATE_SUCCESS, data: result }).send(res);
  });

  getContents = asyncHandler(async (req, res, next) => {
    const result = await contentService.getContents(req.query, req.user);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getContentById = asyncHandler(async (req, res, next) => {
    const result = await contentService.getContentById(req.params.id, req.user);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  updateContent = asyncHandler(async (req, res, next) => {
    const result = await contentService.updateContent(req.params.id, req.body, req.file, req.user);
    new OK({ message: CONTENT_MESSAGE.UPDATE_SUCCESS, data: result }).send(res);
  });

  deleteContent = asyncHandler(async (req, res, next) => {
    const result = await contentService.deleteContent(req.params.id, req.user);
    new OK({ message: CONTENT_MESSAGE.DELETE_SUCCESS, data: result }).send(res);
  });

  // Get contents for specific facility (Manager access)
  getFacilityContents = asyncHandler(async (req, res, next) => {
    const { facilityId } = req.params;
    const result = await contentService.getContentsByFacility(facilityId, req.query, req.user);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  // Get system-wide contents (Public access)
  getSystemContents = asyncHandler(async (req, res, next) => {
    const result = await contentService.getSystemContents(req.query);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  // Get all published contents (Public access - both system and facility)
  getAllPublishedContents = asyncHandler(async (req, res, next) => {
    const result = await contentService.getAllPublishedContents(req.query);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  // Get content statistics
  getContentStats = asyncHandler(async (req, res, next) => {
    const result = await contentService.getContentStats(req.user);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });
}

module.exports = new ContentController();
