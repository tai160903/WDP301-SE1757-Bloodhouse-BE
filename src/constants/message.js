const ACCESS_MESSAGE = {
  LOGIN_SUCCESS: "Login successfully",
  LOGIN_FAILED: "Login failed",
  REGISTER_SUCCESS: "Register successfully",
  REGISTER_FAILED: "Register failed",
  LOGOUT_SUCCESS: "Logout successfully",
  LOGOUT_FAILED: "Logout failed",
  REFRESH_TOKEN_SUCCESS: "Refresh token successfully",
  REFRESH_TOKEN_FAILED: "Refresh token failed",
  FORGOT_PASSWORD_SUCCESS: "Forgot password successfully",
  FORGOT_PASSWORD_FAILED: "Forgot password failed",
  RESET_PASSWORD_SUCCESS: "Reset password successfully",
  RESET_PASSWORD_FAILED: "Reset password failed",
  VERIFY_EMAIL_SUCCESS: "Verify email successfully",
  VERIFY_EMAIL_FAILED: "Verify email failed",
  GET_FCM_TOKEN_SUCCESS: "Get FCM token successfully",
  GET_FCM_TOKEN_FAILED: "Get FCM token failed",
};

const USER_MESSAGE = {
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  USER_UPDATE_SUCCESS: "User updated successfully",
  USER_UPDATE_FAILED: "User update failed",
  USER_DELETE_SUCCESS: "User deleted successfully",
  USER_DELETE_FAILED: "User delete failed",
  USER_GET_PROFILE_SUCCESS: "Get user profile successfully",
  USER_UPDATE_PROFILE_SUCCESS: "Update user profile successfully",
  USER_CHANGE_PASSWORD_SUCCESS: "Change password successfully",
  USER_CHANGE_AVATAR_SUCCESS: "Update avatar successfully",
  USER_SAVE_FCM_TOKEN_SUCCESS: "Save FCM token successfully",
};

const FACILITY_MESSAGE = {
  GET_ALL_FACILITIES_SUCCESS: "Get all facilities successfully",
  GET_ALL_FACILITIES_FAILED: "Get all facilities failed",
  GET_FACILITY_BY_ID_SUCCESS: "Get facility by id successfully",
  GET_FACILITY_BY_ID_FAILED: "Get facility by id failed",
  CREATE_FACILITY_SUCCESS: "Create facility successfully",
  CREATE_FACILITY_FAILED: "Create facility failed",
  UPDATE_FACILITY_SUCCESS: "Update facility successfully",
  UPDATE_FACILITY_FAILED: "Update facility failed",
  DELETE_FACILITY_SUCCESS: "Delete facility successfully",
  DELETE_FACILITY_FAILED: "Delete facility failed",
  FACILITY_NOT_FOUND: "Facility not found",
  FACILITY_ALREADY_EXISTS: "Facility already exists",
};

module.exports = {
  ACCESS_MESSAGE,
  USER_MESSAGE,
  FACILITY_MESSAGE,
};
