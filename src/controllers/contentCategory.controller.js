"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { CONTENT_CATEGORY_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const contentCategoryService = require("../services/contentCategory.service");

class ContentCategoryController {
  createContentCategory = asyncHandler(async (req, res, next) => {
    const result = await contentCategoryService.createContentCategory(req.body);
    new CREATED({ message: CONTENT_CATEGORY_MESSAGE.CREATE_SUCCESS, data: result }).send(
      res
    );
  });

  getContentCategories = asyncHandler(async (req, res, next) => {
    const result = await contentCategoryService.getContentCategories();
    new OK({ message: CONTENT_CATEGORY_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  updateContentCategory = asyncHandler(async (req, res, next) => {
    const result = await contentCategoryService.updateContentCategory(req.params.id, req.body);
    new OK({ message: CONTENT_CATEGORY_MESSAGE.UPDATE_SUCCESS, data: result }).send(res);
  });
}

module.exports = new ContentCategoryController();
