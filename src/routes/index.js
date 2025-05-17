"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
module.exports = router;
