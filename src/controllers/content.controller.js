"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { CONTENT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const contentService = require("../services/content.service");

class ContentController {
  createContent = asyncHandler(async (req, res, next) => {
    const result = await contentService.createContent(req.body, req.file);
    new CREATED({ message: CONTENT_MESSAGE.CREATE_SUCCESS, data: result }).send(res);
  });

  getContents = asyncHandler(async (req, res, next) => {
    const result = await contentService.getContents(req.query);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getContentById = asyncHandler(async (req, res, next) => {
    const result = await contentService.getContentById(req.params.id);
    new OK({ message: CONTENT_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  updateContent = asyncHandler(async (req, res, next) => {
    const result = await contentService.updateContent(req.params.id, req.body, req.file);
    new OK({ message: CONTENT_MESSAGE.UPDATE_SUCCESS, data: result }).send(res);
  });
}

module.exports = new ContentController();
