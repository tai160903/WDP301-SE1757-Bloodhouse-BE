"use strict";

const contentModel = require("../models/content.model");
const { uploadSingleImage } = require("../helpers/cloudinaryHelper");
const { CONTENT_STATUS, USER_ROLE } = require("../constants/enum");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { BadRequestError, ForbiddenError, NotFoundError } = require("../configs/error.response");
const mongoose = require("mongoose");

class ContentService {
  createContent = async (
    { type, categoryId, title, content, summary, authorId, facilityId },
    file,
    userContext = null
  ) => {
    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "content" });
      image = result.url;
    }

    let finalFacilityId = facilityId;
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin có thể tạo content hệ thống (null) hoặc cho cơ sở cụ thể
        finalFacilityId = facilityId || null;
      } else if (userContext.facilityId) {
        // Manager chỉ có thể tạo content cho cơ sở của mình
        finalFacilityId = userContext.facilityId;
      }
    }

    const newContent = await contentModel.create({
      type,
      categoryId,
      facilityId: finalFacilityId,
      title,
      image,
      content,
      summary,
      authorId,
      status: CONTENT_STATUS.PUBLISHED,
    });
    return newContent;
  };

  getContents = async (queryParams, userContext = null) => {
    const { status, facilityId, limit = 10, page = 1 } = queryParams;
    const query = {};
    
    if (status) query.status = status;
    
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin có thể xem tất cả content
        if (facilityId === "system") {
          // Chỉ content hệ thống
          query.facilityId = null;
        } else if (facilityId && mongoose.Types.ObjectId.isValid(facilityId)) {
          // Content của cơ sở cụ thể
          query.facilityId = facilityId;
        }
        // Nếu không có facilityId filter thì lấy tất cả
      } else if (userContext.facilityId) {
        // Manager/Nurse: chỉ thấy content của cơ sở mình + content hệ thống
        query.$or = [
          { facilityId: userContext.facilityId },
          { facilityId: null }
        ];
      }
    } else {
      // Public user: chỉ thấy content hệ thống
      query.facilityId = null;
    }

    const result = await getPaginatedData({
      model: contentModel,
      query,
      page,
      limit,
      populate: [
        { path: "categoryId", select: "name" },
        { path: "authorId", select: "username avatar fullName" },
        { path: "facilityId", select: "name code address" },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  getContentById = async (id, userContext = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid content ID format");
    }

    const content = await contentModel
      .findById(id)
      .populate("categoryId")
      .populate("authorId", "username avatar fullName")
      .populate("facilityId", "name code address");

    if (!content) {
      throw new NotFoundError("Content not found");
    }

    // Kiểm tra quyền truy cập
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin có thể xem mọi content
        return content;
      } else if (userContext.facilityId) {
        // Manager/Nurse: có thể xem content của cơ sở mình + content hệ thống
        if (content.facilityId === null || 
            (content.facilityId && content.facilityId._id.toString() === userContext.facilityId.toString())) {
          return content;
        } else {
          throw new ForbiddenError("You don't have permission to view this content");
        }
      }
    } else {
      // Public user: chỉ có thể xem content hệ thống và content đã published
      if (content.facilityId !== null) {
        throw new ForbiddenError("This content is not publicly accessible");
      }
      if (content.status !== CONTENT_STATUS.PUBLISHED) {
        throw new ForbiddenError("This content is not published");
      }
    }

    return content;
  };

  updateContent = async (id, updateData, file, userContext = null) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid content ID format");
    }

    const existingContent = await contentModel.findById(id);
    if (!existingContent) {
      throw new NotFoundError("Content not found");
    }

    // Kiểm tra quyền cập nhật
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin có thể cập nhật mọi content
      } else if (userContext.facilityId) {
        // Manager chỉ có thể cập nhật content của cơ sở mình
        if (!existingContent.facilityId || 
            existingContent.facilityId.toString() !== userContext.facilityId.toString()) {
          throw new ForbiddenError("You don't have permission to update this content");
        }
      } else {
        throw new ForbiddenError("You don't have permission to update content");
      }
    } else {
      throw new ForbiddenError("Authentication required");
    }

    let image = null;
    if (file) {
      const result = await uploadSingleImage({ file, folder: "content" });
      image = result.url;
      updateData.image = image;
    }

    const content = await contentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate([
      { path: "categoryId", select: "name" },
      { path: "authorId", select: "username avatar fullName" },
      { path: "facilityId", select: "name code address" },
    ]);

    return content;
  };

  getContentsByFacility = async (facilityId, queryParams, userContext = null) => {
    if (!mongoose.Types.ObjectId.isValid(facilityId)) {
      throw new BadRequestError("Invalid facility ID format");
    }

    // Kiểm tra quyền truy cập
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin có thể xem content của mọi cơ sở
      } else if (userContext.facilityId) {
        // Manager/Nurse chỉ có thể xem content của cơ sở mình
        if (userContext.facilityId.toString() !== facilityId.toString()) {
          throw new ForbiddenError("You don't have permission to view this facility's content");
        }
      } else {
        throw new ForbiddenError("You don't have permission to view facility content");
      }
    } else {
      throw new ForbiddenError("Authentication required");
    }

    const { status, limit = 10, page = 1 } = queryParams;
    const query = { facilityId };
    if (status) query.status = status;
    
    const result = await getPaginatedData({
      model: contentModel,
      query,
      page,
      limit,
      populate: [
        { path: "categoryId", select: "name" },
        { path: "authorId", select: "username avatar fullName" },
        { path: "facilityId", select: "name code address" },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  getSystemContents = async (queryParams) => {
    const { status, limit = 10, page = 1 } = queryParams;
    const query = { facilityId: null };
    if (status) query.status = status;
    
    const result = await getPaginatedData({
      model: contentModel,
      query,
      page,
      limit,
      populate: [
        { path: "categoryId", select: "name" },
        { path: "authorId", select: "username avatar fullName" },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  getAllPublishedContents = async (queryParams) => {
    const { type, categoryId, facilityId, limit = 10, page = 1 } = queryParams;
    const query = { status: CONTENT_STATUS.PUBLISHED };
    
    if (type) query.type = type;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = categoryId;
    }
    
    if (facilityId) {
      if (facilityId === "system") {
        query.facilityId = null;
      } else if (mongoose.Types.ObjectId.isValid(facilityId)) {
        query.facilityId = facilityId;
      }
    }
    
    const result = await getPaginatedData({
      model: contentModel,
      query,
      page,
      limit,
      populate: [
        { path: "categoryId", select: "name" },
        { path: "authorId", select: "username avatar fullName" },
        { path: "facilityId", select: "name code address" },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  deleteContent = async (id, userContext) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid content ID format");
    }

    const existingContent = await contentModel.findById(id);
    if (!existingContent) {
      throw new NotFoundError("Content not found");
    }

    // Kiểm tra quyền xóa
    if (userContext.role === USER_ROLE.ADMIN) {
      // Admin có thể xóa mọi content
    } else if (userContext.facilityId) {
      // Manager chỉ có thể xóa content của cơ sở mình (không thể xóa content hệ thống)
      if (!existingContent.facilityId || 
          existingContent.facilityId.toString() !== userContext.facilityId.toString()) {
        throw new ForbiddenError("You don't have permission to delete this content");
      }
    } else {
      throw new ForbiddenError("You don't have permission to delete content");
    }

    await contentModel.findByIdAndDelete(id);
    return { message: "Content deleted successfully" };
  };

  getContentStats = async (userContext = null) => {
    let matchQuery = {};
    
    if (userContext) {
      if (userContext.role === USER_ROLE.ADMIN) {
        // Admin xem thống kê tất cả content
        // Không cần filter gì
      } else if (userContext.facilityId) {
        // Manager/Nurse: thống kê content của cơ sở mình + content hệ thống
        matchQuery = {
          $or: [
            { facilityId: userContext.facilityId },
            { facilityId: null }
          ]
        };
      }
    } else {
      // Public: chỉ thống kê content hệ thống
      matchQuery = { facilityId: null };
    }

    const stats = await contentModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ["$status", CONTENT_STATUS.PUBLISHED] }, 1, 0] }
          },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", CONTENT_STATUS.DRAFT] }, 1, 0] }
          },
          archived: {
            $sum: { $cond: [{ $eq: ["$status", CONTENT_STATUS.ARCHIVED] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, published: 0, draft: 0, archived: 0 };
  };
}

module.exports = new ContentService();
