"use strict";

const { BadRequestError } = require("../configs/error.response");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const processUploadResult = (file) => ({
  url: file.secure_url, // URL từ Cloudinary được gán vào file.path
  publicId: file.public_id, // publicId có thể là filename hoặc public_id
});

const uploadSingleImage = async ({
  file,
  folder = "checkafe",
  transformations = [],
  options = {},
}) => {
  try {
    if (!file) {
      throw new BadRequestError("No file provided for upload");
    }

    if (file.buffer) {
      // Convert buffer to base64
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'auto',
        ...options
      });

      return processUploadResult(result);
    }
    // Với multer-storage-cloudinary, file đã được upload trực tiếp
    // Kết quả nằm trong file.path (url) và file.filename/public_id (publicId)
    throw new BadRequestError("Invalid file format");
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to upload single image to Cloudinary"
    );
  }
};

const uploadMultipleImages = async ({
  files,
  folder = "checkafe",
  transformations = [],
  options = {},
}) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestError("No files provided for upload");
    }

    return files.map(processUploadResult);
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to upload multiple images to Cloudinary"
    );
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new BadRequestError("Public ID is required to delete image");
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to delete image from Cloudinary"
    );
  }
};

const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new BadRequestError("No public IDs provided for deletion");
    }
    await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to delete multiple images from Cloudinary"
    );
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};
