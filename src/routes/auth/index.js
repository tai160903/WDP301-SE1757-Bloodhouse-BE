"use strict";

const express = require("express");
const authController = require("../../controllers/auth.controller");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();

// auth routes
router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);

router.use(checkAuth);
router.post("/sign-out", authController.signOut);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
