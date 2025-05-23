"use strict";

const { BadRequestError } = require("../configs/error.response");

const getPaginatedData = async ({
  model, // Model Mongoose (User, Order, v.v.)
  query = {}, // Điều kiện lọc (filter)
  page = 1, // Trang hiện tại
  limit = 10, // Số lượng bản ghi mỗi trang
  select = "", // Các trường cần lấy
  populate = [], // Các trường cần populate
  search = "", // Từ khóa tìm kiếm
  searchFields = [], // Các trường để tìm kiếm
  sort = { createdAt: -1 }, // Sắp xếp mặc định theo createdAt giảm dần
}) => {
  try {
    // Step 1: Chuẩn hóa input
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestError("Page must be a positive integer");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new BadRequestError("Limit must be a positive integer");
    }

    // Step 2: Xây dựng query tìm kiếm
    let finalQuery = { ...query };
    if (search && searchFields.length > 0) {
      const searchRegex = new RegExp(search, "i"); // Không phân biệt hoa thường
      finalQuery.$or = searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }


    // Step 3: Tính toán phân trang
    const skip = (pageNum - 1) * limitNum;
    // Step 4: Thực hiện truy vấn
    const dataPromise = model
    .find(finalQuery)
    .select(select)
    .populate(populate)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    



    const totalPromise = model.countDocuments(finalQuery);

    // Step 5: Chạy đồng thời để lấy dữ liệu và tổng số bản ghi
    const [data, total] = await Promise.all([dataPromise, totalPromise]);

    // Step 6: Trả về kết quả với metadata
    return {
      data,
      metadata: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to retrieve paginated data"
    );
  }
};

/**
 * Hàm helper để thực hiện nested populate qua nhiều bảng
 * @param {Object} options
 * @param {Object} options.model - Mongoose model để query
 * @param {Object} options.query - Điều kiện lọc (filter)
 * @param {String} options.select - Các trường cần lấy
 * @param {Array} options.nestedPopulate - Mảng các nested populate config
 * @param {Object} options.sort - Sắp xếp
 * @param {Number} options.page - Trang hiện tại (nếu cần phân trang)
 * @param {Number} options.limit - Số lượng bản ghi mỗi trang (nếu cần phân trang)
 * @param {Boolean} options.isPaginated - Có sử dụng phân trang không
 * 
 * @example
 * // Ví dụ cho ProcessDonationLog
 * const result = await getNestedPopulatedData({
 *   model: processDonationLogModel,
 *   query: { registrationId: "someId" },
 *   select: "_id registrationId status notes changedAt",
 *   nestedPopulate: [
 *     {
 *       path: "changedBy",
 *       select: "_id userId position",
 *       populate: {
 *         path: "userId",
 *         select: "_id fullName email phone avatar"
 *       }
 *     },
 *     {
 *       path: "registrationId", 
 *       select: "_id userId preferredDate",
 *       populate: {
 *         path: "userId",
 *         select: "_id fullName phone"
 *       }
 *     }
 *   ],
 *   sort: { changedAt: -1 },
 *   isPaginated: true,
 *   page: 1,
 *   limit: 10
 * });
 */
const getNestedPopulatedData = async ({
  model,
  query = {},
  select = "",
  nestedPopulate = [],
  sort = { createdAt: -1 },
  page = 1,
  limit = 10,
  isPaginated = false,
  search = "",
  searchFields = []
}) => {
  try {
    // Xây dựng query tìm kiếm
    let finalQuery = { ...query };
    if (search && searchFields.length > 0) {
      const searchRegex = new RegExp(search, "i");
      finalQuery.$or = searchFields.map((field) => ({
        [field]: searchRegex,
      }));
    }

    // Tạo base query
    let queryBuilder = model.find(finalQuery);

    // Áp dụng select nếu có
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    // Áp dụng nested populate
    if (nestedPopulate && nestedPopulate.length > 0) {
      nestedPopulate.forEach(populateConfig => {
        queryBuilder = queryBuilder.populate(populateConfig);
      });
    }

    // Áp dụng sort
    if (sort) {
      queryBuilder = queryBuilder.sort(sort);
    }

    if (isPaginated) {
      // Xử lý phân trang
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestError("Page must be a positive integer");
      }
      if (isNaN(limitNum) || limitNum < 1) {
        throw new BadRequestError("Limit must be a positive integer");
      }

      const skip = (pageNum - 1) * limitNum;
      queryBuilder = queryBuilder.skip(skip).limit(limitNum);

      // Lấy tổng số bản ghi để tính metadata
      const totalPromise = model.countDocuments(finalQuery);
      const [data, total] = await Promise.all([queryBuilder.exec(), totalPromise]);

      return {
        data,
        metadata: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } else {
      // Không phân trang, trả về tất cả dữ liệu
      const data = await queryBuilder.exec();
      return {
        data,
        metadata: {
          total: data.length,
        },
      };
    }
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to retrieve nested populated data"
    );
  }
};

/**
 * Hàm helper để thực hiện nested populate trên một document đã tồn tại
 * @param {Object} options
 * @param {Object} options.document - Document cần populate
 * @param {Array} options.nestedPopulate - Mảng các nested populate config
 * 
 * @example
 * const populatedDoc = await populateExistingDocument({
 *   document: existingProcessDonationLog,
 *   nestedPopulate: [
 *     {
 *       path: "changedBy",
 *       select: "_id userId position",
 *       populate: {
 *         path: "userId",
 *         select: "_id fullName email phone avatar"
 *       }
 *     }
 *   ]
 * });
 */
const populateExistingDocument = async ({
  document,
  nestedPopulate = []
}) => {
  try {
    if (!document) {
      throw new BadRequestError("Document is required");
    }

    let populatedDoc = document;

    // Áp dụng từng nested populate
    for (const populateConfig of nestedPopulate) {
      populatedDoc = await populatedDoc.populate(populateConfig);
    }

    return populatedDoc;
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to populate existing document"
    );
  }
};

/**
 * Hàm helper để tạo nested populate config một cách dễ dàng
 * @param {String} path - Đường dẫn cần populate
 * @param {String} select - Các trường cần lấy
 * @param {Object} nestedConfig - Config cho nested populate
 * 
 * @example
 * const facilityStaffPopulate = createNestedPopulateConfig(
 *   "changedBy",
 *   "_id userId position",
 *   {
 *     path: "userId",
 *     select: "_id fullName email phone avatar"
 *   }
 * );
 */
const createNestedPopulateConfig = (path, select = "", nestedConfig = null) => {
  const config = {
    path,
    select
  };

  if (nestedConfig) {
    config.populate = nestedConfig;
  }

  return config;
};

module.exports = { 
  getPaginatedData,
  getNestedPopulatedData,
  populateExistingDocument,
  createNestedPopulateConfig
};
