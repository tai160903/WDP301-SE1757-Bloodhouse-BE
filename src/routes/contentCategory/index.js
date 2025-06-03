"use strict";

const express = require("express");
const router = express.Router();
const contentCategoryController = require("../../controllers/contentCategory.controller");

router.post("/", contentCategoryController.createContentCategory);
router.get("/", contentCategoryController.getContentCategories);
router.put("/:id", contentCategoryController.updateContentCategory);

module.exports = router;
