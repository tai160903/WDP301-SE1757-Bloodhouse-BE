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

const BLOOD_COMPATIBILITY_MESSAGE = {
  CREATE_SUCCESS: "Create blood compatibility successfully",
  CREATE_FAILED: "Create blood compatibility failed",
  UPDATE_SUCCESS: "Update blood compatibility successfully",
  UPDATE_FAILED: "Update blood compatibility failed",
  GET_SUCCESS: "Get blood compatibility successfully",
  GET_FAILED: "Get blood compatibility failed",
};

const BLOOD_COMPONENT_MESSAGE = {
  CREATE_SUCCESS: "Create blood component successfully",
  CREATE_FAILED: "Create blood component failed",
  UPDATE_SUCCESS: "Update blood component successfully",
  UPDATE_FAILED: "Update blood component failed",
  GET_SUCCESS: "Get blood component successfully",
  GET_FAILED: "Get blood component failed",
};

const BLOOD_GROUP_MESSAGE = {
  CREATE_SUCCESS: "Create blood group successfully",
  CREATE_FAILED: "Create blood group failed",
  UPDATE_SUCCESS: "Update blood group successfully",
  UPDATE_FAILED: "Update blood group failed",
  GET_SUCCESS: "Get blood group successfully",
  GET_FAILED: "Get blood group failed",
};

const CONTENT_CATEGORY_MESSAGE = {
  CREATE_SUCCESS: "Create content category successfully",
  CREATE_FAILED: "Create content category failed",
  UPDATE_SUCCESS: "Update content category successfully",
  UPDATE_FAILED: "Update content category failed",
};

const CONTENT_MESSAGE = {
  CREATE_SUCCESS: "Create content successfully",
  CREATE_FAILED: "Create content failed",
  UPDATE_SUCCESS: "Update content successfully",
  UPDATE_FAILED: "Update content failed",
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

const BLOOD_DONATION_REGISTRATION_MESSAGE = {
  CREATE_SUCCESS: "Create blood donation registration successfully",
  UPDATE_SUCCESS: "Update blood donation registration successfully",
  UPDATE_FAILED: "Update blood donation registration failed",
  GET_SUCCESS: "Get blood donation registration successfully",
  GET_FAILED: "Get blood donation registration failed",
  APPROVE_SUCCESS: "Approve blood donation registration successfully",
  APPROVE_FAILED: "Approve blood donation registration failed",
  REJECT_SUCCESS: "Reject blood donation registration successfully",
  REJECT_FAILED: "Reject blood donation registration failed",
  GET_DETAIL_SUCCESS: "Get blood donation registration detail successfully",
  GET_DETAIL_FAILED: "Get blood donation registration detail failed",
};

const BLOOD_REQUEST_MESSAGE = {
  CREATE_SUCCESS: "Tạo yêu cầu máu thành công",
  GET_FACILITY_SUCCESS: "Lấy danh sách yêu cầu máu của cơ sở thành công",
  GET_USER_SUCCESS: "Lấy danh sách yêu cầu máu của người dùng thành công",
  GET_DETAILS_SUCCESS: "Lấy chi tiết yêu cầu máu thành công",
  UPDATE_STATUS_SUCCESS: "Cập nhật trạng thái yêu cầu máu thành công",
  GET_FACILITY_USER_SUCCESS: "Lấy danh sách yêu cầu máu của cơ sở theo người dùng thành công",
  GET_FACILITY_DETAIL_SUCCESS: "Lấy chi tiết yêu cầu máu của cơ sở thành công",
};

module.exports = {
  ACCESS_MESSAGE,
  BLOOD_COMPATIBILITY_MESSAGE,
  BLOOD_COMPONENT_MESSAGE,
  BLOOD_GROUP_MESSAGE,
  USER_MESSAGE,
  FACILITY_MESSAGE,
  BLOOD_DONATION_REGISTRATION_MESSAGE,
  CONTENT_CATEGORY_MESSAGE,
  CONTENT_MESSAGE,
  BLOOD_REQUEST_MESSAGE,
};
