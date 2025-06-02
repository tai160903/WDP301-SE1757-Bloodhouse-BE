const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const { checkAuth } = require("../../auth/checkAuth");
router.get("/nearby", userController.findNearbyUsers); // Không cần auth
router.post("/forgot-password", userController.forgotPassword); // Không cần auth
router.post("/reset-password", userController.resetPassword); // Không cần auth

router.use(checkAuth);

router.get("/", userController.getUsers);
router.get("/me", userController.getUserInfo);
router.patch("/blood-group", userController.updateBloodGroup);
router.patch("/profile", userController.updateProfile);
router.post("/verify-email", userController.sendVerificationEmail);
router.post("/verify", userController.verifyAccount);
router.post("/verify-level2", userController.verifyLevel2);
router.patch("/password", userController.changePassword);
router.patch("/avatar", userController.updateAvatar);
router.delete("/", userController.deleteAccount);
router.patch("/update-expo-token", userController.updateExpoToken);

module.exports = router;
