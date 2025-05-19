"use strict";

const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/facility", require("./facility.route"));
module.exports = router;
