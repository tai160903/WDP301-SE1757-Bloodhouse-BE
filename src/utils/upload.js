"use strict";

const multer = require("multer");
const { BadRequestError } = require("../configs/error.response");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new BadRequestError("Chỉ chấp nhận file PDF, JPG, hoặc PNG"));
    }
    cb(null, true);
  },
});

module.exports = { upload };