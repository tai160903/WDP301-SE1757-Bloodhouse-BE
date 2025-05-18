"use strict";

const contentCategoryModel = require("../models/contentCategory.model");

class ContentCategoryService {
  createContentCategory = async ({ name, description }) => {
    const contentCategory = await contentCategoryModel.create({ name, description });
    return contentCategory;
  }

  getContentCategories = async () => {
    const contentCategories = await contentCategoryModel.find();
    return contentCategories;
  }

  updateContentCategory = async (id, { name, description }) => {
    const contentCategory = await contentCategoryModel.findByIdAndUpdate(id, { name, description }, { new: true });
    return contentCategory;
  }
}

module.exports = new ContentCategoryService();