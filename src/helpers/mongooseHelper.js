"use strict";

const { BadRequestError } = require("../configs/error.response");

/**
 * MONGOOSE HELPER - Hỗ trợ tìm kiếm với dot notation cho nested fields
 * 
 * Các tính năng chính:
 * 1. Phân trang dữ liệu với tìm kiếm
 * 2. Nested populate qua nhiều bảng
 * 3. Tìm kiếm trong nested fields sử dụng dot notation
 * 4. Validation an toàn cho search fields
 * 
 * Ví dụ sử dụng trong service:
 * ```javascript
 * // Tìm kiếm inventory theo tên gift item
 * const result = await getPaginatedData({
 *   model: GiftInventory,
 *   search: "áo thun",
 *   searchFields: ["giftItemId.name", "giftItemId.description"],
 *   populate: [{ path: "giftItemId", select: "name description category" }],
 *   page: 1,
 *   limit: 10
 * });
 * 
 * // Tìm kiếm distribution theo tên người nhận
 * const result = await getPaginatedData({
 *   model: GiftDistribution,
 *   search: "nguyen van a",
 *   searchFields: ["userId.fullName", "userId.phone", "notes"],
 *   populate: [{ path: "userId", select: "fullName phone email" }]
 * });
 * ```
 */

/**
 * Hàm helper để lấy dữ liệu có phân trang từ MongoDB
 * @param {Object} options
 * @param {Object} options.model - Model Mongoose (User, Order, v.v.)
 * @param {Object} options.query - Điều kiện lọc (filter)
 * @param {Number} options.page - Trang hiện tại
 * @param {Number} options.limit - Số lượng bản ghi mỗi trang
 * @param {String} options.select - Các trường cần lấy
 * @param {Array} options.populate - Các trường cần populate
 * @param {String} options.search - Từ khóa tìm kiếm
 * @param {Array} options.searchFields - Các trường để tìm kiếm (hỗ trợ dot notation cho nested fields)
 * @param {Object} options.sort - Sắp xếp mặc định theo createdAt giảm dần
 * 
 * @example
 * // Tìm kiếm trong field đơn giản
 * const result = await getPaginatedData({
 *   model: User,
 *   search: "john",
 *   searchFields: ["fullName", "email"]
 * });
 * 
 * @example
 * // Tìm kiếm trong nested field sử dụng dot notation
 * const result = await getPaginatedData({
 *   model: GiftInventory,
 *   search: "áo thun",
 *   searchFields: ["giftItemId.name", "giftItemId.description"],
 *   populate: [{ path: "giftItemId", select: "name description category" }]
 * });
 * 
 * @example
 * // Tìm kiếm trong nested field nhiều cấp
 * const result = await getPaginatedData({
 *   model: Order,
 *   search: "nguyen",
 *   searchFields: ["userId.fullName", "userId.profile.address", "items.productId.name"],
 *   populate: [
 *     { path: "userId", populate: { path: "profile" } },
 *     { path: "items.productId" }
 *   ]
 * });
 */
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
    const searchQuery = buildSearchQuery(search, searchFields);
    if (searchQuery) {
      finalQuery = { ...finalQuery, ...searchQuery };
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
 * @param {String} options.search - Từ khóa tìm kiếm
 * @param {Array} options.searchFields - Các trường để tìm kiếm (hỗ trợ dot notation cho nested fields)
 * 
 * @example
 * // Ví dụ cho ProcessDonationLog với tìm kiếm nested field
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
 *   limit: 10,
 *   search: "john",
 *   searchFields: ["changedBy.userId.fullName", "registrationId.userId.fullName", "notes"]
 * });
 * 
 * @example
 * // Ví dụ cho GiftInventory với tìm kiếm trong giftItem
 * const result = await getNestedPopulatedData({
 *   model: GiftInventory,
 *   search: "áo thun",
 *   searchFields: ["giftItemId.name", "giftItemId.description"],
 *   nestedPopulate: [
 *     { path: "giftItemId", select: "name description image unit category isActive" }
 *   ],
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
    const searchQuery = buildSearchQuery(search, searchFields);
    if (searchQuery) {
      finalQuery = { ...finalQuery, ...searchQuery };
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

/**
 * Hàm helper để validate và xử lý search fields với dot notation
 * @param {String} search - Từ khóa tìm kiếm
 * @param {Array} searchFields - Mảng các field để tìm kiếm
 * @returns {Object|null} - Query object hoặc null nếu không có search
 * 
 * @example
 * const searchQuery = buildSearchQuery("john", ["fullName", "userId.fullName", "profile.address"]);
 * // Trả về: { $or: [{ fullName: /john/i }, { "userId.fullName": /john/i }, { "profile.address": /john/i }] }
 */
const buildSearchQuery = (search, searchFields = []) => {
  if (!search || !searchFields.length) {
    return null;
  }

  const searchRegex = new RegExp(search, "i"); // Không phân biệt hoa thường
  
  // Validate và xử lý các search fields
  const validSearchFields = searchFields.filter(field => {
    // Kiểm tra field không rỗng và là string
    if (typeof field !== 'string' || !field.trim()) {
      return false;
    }
    
    // Kiểm tra dot notation hợp lệ (không bắt đầu hoặc kết thúc bằng dấu chấm)
    if (field.startsWith('.') || field.endsWith('.') || field.includes('..')) {
      console.warn(`Invalid search field format: ${field}`);
      return false;
    }
    
    return true;
  });

  if (!validSearchFields.length) {
    return null;
  }

  return {
    $or: validSearchFields.map((field) => ({
      [field]: searchRegex,
    }))
  };
};

module.exports = { 
  getPaginatedData,
  getNestedPopulatedData,
  populateExistingDocument,
  createNestedPopulateConfig,
  buildSearchQuery
};
