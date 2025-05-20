"use strict";

const contentModel = require("../models/content.model");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const { CONTENT_STATUS } = require("../constants/enum");

class ContentService {
  createContent = async (
    { type, categoryId, title, content, summary, authorId },
    file
  ) => {
    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "content" });
      image = result.url;
    }
    const newContent = await contentModel.create({
      type,
      categoryId,
      title,
      image,
      content,
      summary,
      authorId,
      status: CONTENT_STATUS.PUBLISHED,
    });
    return newContent;
  };

  getContents = async () => {
    const contents = await contentModel
      .find()
      .populate("categoryId")
      .populate("authorId", "username avatar fullName")
      .sort({ createdAt: -1 });
    return contents;
  };

  getContentById = async (id) => {
    const content = await contentModel
      .findById(id)
      .populate("categoryId")
      .populate("authorId", "username avatar fullName");
    return content;
  };

  updateContent = async (id, updateData, file) => {
    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "content" });
      image = result.url;
    }
    const content = await contentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return content;
  };
}

module.exports = new ContentService();
