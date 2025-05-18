"use strict";

const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/blood-component", require("./bloodComponent"));
router.use("/blood-group", require("./bloodGroup"));
router.use("/blood-compatibility", require("./bloodCompatibility"));
router.use("/users", require("./user"));
module.exports = router;
