const ACCESS_MESSAGE = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGIN_FAILED: "Đăng nhập thất bại",
  REGISTER_SUCCESS: "Đăng ký thành công",
  REGISTER_FAILED: "Đăng ký thất bại",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  LOGOUT_FAILED: "Đăng xuất thất bại",
  REFRESH_TOKEN_SUCCESS: "Làm mới token thành công",
  REFRESH_TOKEN_FAILED: "Làm mới token thất bại",
  FORGOT_PASSWORD_SUCCESS: "Quên mật khẩu thành công",
  FORGOT_PASSWORD_FAILED: "Quên mật khẩu thất bại",
  RESET_PASSWORD_SUCCESS: "Đặt lại mật khẩu thành công",
  RESET_PASSWORD_FAILED: "Đặt lại mật khẩu thất bại",
  VERIFY_EMAIL_SUCCESS: "Xác thực email thành công",
  VERIFY_EMAIL_FAILED: "Xác thực email thất bại",
  GET_FCM_TOKEN_SUCCESS: "Lấy FCM token thành công",
  GET_FCM_TOKEN_FAILED: "Lấy FCM token thất bại",
};

const EMERGENCY_CAMPAIGN_MESSAGE = {
  CREATE_SUCCESS: "Tạo chiến dịch khẩn cấp thành công",
  CREATE_FAILED: "Tạo chiến dịch khẩn cấp thất bại",
  UPDATE_SUCCESS: "Cập nhật chiến dịch khẩn cấp thành công",
  UPDATE_FAILED: "Cập nhật chiến dịch khẩn cấp thất bại",
  GET_SUCCESS: "Lấy chiến dịch khẩn cấp thành công",
  GET_FAILED: "Lấy chiến dịch khẩn cấp thất bại",
};

const BLOOD_INVENTORY_MESSAGE = {
  CREATE_SUCCESS: "Tạo tương hợp máu thành công",
  CREATE_FAILED: "Tạo tương hợp máu thất bại",
  UPDATE_SUCCESS: "Cập nhật tương hợp máu thành công",
  UPDATE_FAILED: "Cập nhật tương hợp máu thất bại",
  GET_SUCCESS: "Lấy tương hợp máu thành công",
  GET_FAILED: "Lấy tương hợp máu thất bại",
};

const BLOOD_COMPATIBILITY_MESSAGE = {
  CREATE_SUCCESS: "Tạo tương hợp máu thành công",
  CREATE_FAILED: "Tạo tương hợp máu thất bại",
  UPDATE_SUCCESS: "Cập nhật tương hợp máu thành công",
  UPDATE_FAILED: "Cập nhật tương hợp máu thất bại",
  GET_SUCCESS: "Lấy tương hợp máu thành công",
  GET_FAILED: "Lấy tương hợp máu thất bại",
};

const BLOOD_COMPONENT_MESSAGE = {
  CREATE_SUCCESS: "Tạo thành công",
  CREATE_FAILED: "Tạo thất bại",
  UPDATE_SUCCESS: "Cập nhật thành công",
  UPDATE_FAILED: "Cập nhật thất bại",
  GET_SUCCESS: "Lấy thành công",
  GET_FAILED: "Lấy thất bại",
};

const BLOOD_DONATION_REGISTRATION_MESSAGE = {
  CREATE_SUCCESS: "Tạo đăng ký hiến máu thành công",
  CREATE_FAILED: "Tạo đăng ký hiến máu thất bại",
  UPDATE_SUCCESS: "Cập nhật đăng ký hiến máu thành công",
  UPDATE_FAILED: "Cập nhật đăng ký hiến máu thất bại",
  GET_SUCCESS: "Lấy đăng ký hiến máu thành công",
  GET_FAILED: "Lấy đăng ký hiến máu thất bại",
  APPROVE_SUCCESS: "Phê duyệt đăng ký hiến máu thành công",
  APPROVE_FAILED: "Phê duyệt đăng ký hiến máu thất bại",
  REJECT_SUCCESS: "Từ chối đăng ký hiến máu thành công",
  REJECT_FAILED: "Từ chối đăng ký hiến máu thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết đăng ký hiến máu thành công",
  GET_DETAIL_FAILED: "Lấy chi tiết đăng ký hiến máu thất bại",
};

const BLOOD_GROUP_MESSAGE = {
  BLOOD_GROUP_NOT_FOUND: "Nhóm máu không tồn tại",
  CREATE_SUCCESS: "Tạo nhóm máu thành công",
  CREATE_FAILED: "Tạo nhóm máu thất bại",
  UPDATE_SUCCESS: "Cập nhật nhóm máu thành công",
  UPDATE_FAILED: "Cập nhật nhóm máu thất bại",
  GET_SUCCESS: "Lấy nhóm máu thành công",
  GET_FAILED: "Lấy nhóm máu thất bại",
};

const CONTENT_CATEGORY_MESSAGE = {
  CREATE_SUCCESS: "Tạo danh mục nội dung thành công",
  CREATE_FAILED: "Tạo danh mục nội dung thất bại",
  UPDATE_SUCCESS: "Cập nhật danh mục nội dung thành công",
  UPDATE_FAILED: "Cập nhật danh mục nội dung thất bại",
};

const CONTENT_MESSAGE = {
  CREATE_SUCCESS: "Tạo nội dung thành công",
  CREATE_FAILED: "Tạo nội dung thất bại",
  UPDATE_SUCCESS: "Cập nhật nội dung thành công",
  UPDATE_FAILED: "Cập nhật nội dung thất bại",
};

const FACILITY_MESSAGE = {
  GET_ALL_FACILITIES_SUCCESS: "Lấy danh sách cơ sở thành công",
  GET_ALL_FACILITIES_FAILED: "Lấy danh sách cơ sở thất bại",
  GET_FACILITY_BY_ID_SUCCESS: "Lấy thông tin cơ sở thành công",
  GET_FACILITY_BY_ID_FAILED: "Lấy thông tin cơ sở thất bại",
  CREATE_FACILITY_SUCCESS: "Tạo cơ sở thành công",
  CREATE_FACILITY_FAILED: "Tạo cơ sở thất bại",
  UPDATE_FACILITY_SUCCESS: "Cập nhật cơ sở thành công",
  UPDATE_FACILITY_FAILED: "Cập nhật cơ sở thất bại",
  DELETE_FACILITY_SUCCESS: "Xóa cơ sở thành công",
  DELETE_FACILITY_FAILED: "Xóa cơ sở thất bại",
  FACILITY_NOT_FOUND: "Cơ sở không tồn tại",
  FACILITY_ALREADY_EXISTS: "Cơ sở đã tồn tại",
  MANAGER_REQUIRED: "Cơ sở phải có ít nhất 1 quản lý",
  FACILITY_NOT_FOUND: "Cơ sở không tồn tại",
};

const FACILITY_STAFF_MESSAGE = {
  GET_ALL_FACILITY_STAFFS_SUCCESS: "Lấy danh sách nhân viên cơ sở thành công",
  GET_ALL_FACILITY_STAFFS_FAILED: "Lấy danh sách nhân viên cơ sở thất bại",
  GET_FACILITY_STAFF_BY_ID_SUCCESS: "Lấy thông tin nhân viên cơ sở thành công",
  GET_FACILITY_STAFF_BY_ID_FAILED: "Lấy thông tin nhân viên cơ sở thất bại",
  CREATE_FACILITY_STAFF_SUCCESS: "Tạo nhân viên cơ sở thành công",
  CREATE_FACILITY_STAFF_FAILED: "Tạo nhân viên cơ sở thất bại",
  UPDATE_FACILITY_STAFF_SUCCESS: "Cập nhật nhân viên cơ sở thành công",
  UPDATE_FACILITY_STAFF_FAILED: "Cập nhật nhân viên cơ sở thất bại",
  DELETE_FACILITY_STAFF_SUCCESS: "Xóa nhân viên cơ sở thành công",
  DELETE_FACILITY_STAFF_FAILED: "Xóa nhân viên cơ sở thất bại",
  STAFF_ALREADY_EXISTS: "Nhân viên cơ sở đã tồn tại",
  STAFF_NOT_FOUND: "Nhân viên cơ sở không tồn tại",
  MANAGER_NOT_FOUND:
    "Quản lý không tồn tại hoặc đã được phân công cho cơ sở khác",
  DOCTOR_NOT_FOUND:
    "Bác sĩ không tồn tại hoặc đã được phân công cho cơ sở khác",
  NURSE_NOT_FOUND:
    "Nhân viên y tế không tồn tại hoặc đã được phân công cho cơ sở khác",
};

const USER_MESSAGE = {
  USER_NOT_FOUND: "Người dùng không tồn tại",
  USER_ALREADY_EXISTS: "Người dùng đã tồn tại",
  USER_UPDATE_SUCCESS: "Cập nhật người dùng thành công",
  USER_UPDATE_FAILED: "Cập nhật người dùng thất bại",
  USER_DELETE_SUCCESS: "Xóa người dùng thành công",
  USER_DELETE_FAILED: "Xóa người dùng thất bại",
  USER_GET_PROFILE_SUCCESS: "Lấy thông tin người dùng thành công",
  USER_UPDATE_PROFILE_SUCCESS: "Cập nhật thông tin người dùng thành công",
  USER_CHANGE_PASSWORD_SUCCESS: "Đổi mật khẩu thành công",
  USER_CHANGE_AVATAR_SUCCESS: "Cập nhật ảnh đại diện thành công",
  USER_SAVE_FCM_TOKEN_SUCCESS: "Lưu FCM token thành công",
  USER_HAS_PENDING_REGISTRATION: "Bạn đã có một đăng ký hiến máu đang chờ xử lý",
};

const BLOOD_REQUEST_MESSAGE = {
  CREATE_SUCCESS: "Tạo yêu cầu máu thành công",
  GET_FACILITY_SUCCESS: "Lấy danh sách yêu cầu máu của cơ sở thành công",
  GET_USER_SUCCESS: "Lấy danh sách yêu cầu máu của người dùng thành công",
  GET_DETAILS_SUCCESS: "Lấy chi tiết yêu cầu máu thành công",
  UPDATE_STATUS_SUCCESS: "Cập nhật trạng thái yêu cầu máu thành công",
  GET_FACILITY_USER_SUCCESS:
    "Lấy danh sách yêu cầu máu của cơ sở theo người dùng thành công",
  GET_FACILITY_DETAIL_SUCCESS: "Lấy chi tiết yêu cầu máu của cơ sở thành công",
};

const FEEDBACK_MESSAGE = {
  FEEDBACK_NOT_FOUND: "Phản hồi không tồn tại",
  CREATE_SUCCESS: "Tạo phản hồi thành công",
  CREATE_FAILED: "Tạo phản hồi thất bại",
  GET_ALL_FEEDBACK_SUCCESS: "Lấy danh sách phản hồi thành công",
  GET_ALL_FEEDBACK_FAILED: "Lấy danh sách phản hồi thất bại",
  GET_FEEDBACK_BY_ID_SUCCESS: "Lấy phản hồi thành công",
  GET_FEEDBACK_BY_ID_FAILED: "Lấy phản hồi thất bại",
  UPDATE_FEEDBACK_SUCCESS: "Cập nhật phản hồi thành công",
  UPDATE_FEEDBACK_FAILED: "Cập nhật phản hồi thất bại",
  DELETE_FEEDBACK_SUCCESS: "Xóa phản hồi thành công",
  DELETE_FEEDBACK_FAILED: "Xóa phản hồi thất bại",
  NOT_AUTHORIZED: "Bạn không có quyền truy cập vào phản hồi này",
};

const HEALTH_CHECK_MESSAGE = {
  CREATE_SUCCESS: "Tạo kiểm tra sức khỏe thành công",
  UPDATE_SUCCESS: "Cập nhật kiểm tra sức khỏe thành công",
  GET_SUCCESS: "Lấy kiểm tra sức khỏe thành công",
};

module.exports = {
  ACCESS_MESSAGE,
  BLOOD_COMPATIBILITY_MESSAGE,
  BLOOD_COMPONENT_MESSAGE,
  BLOOD_DONATION_REGISTRATION_MESSAGE,
  BLOOD_GROUP_MESSAGE,
  CONTENT_CATEGORY_MESSAGE,
  CONTENT_MESSAGE,
  BLOOD_REQUEST_MESSAGE,
  FACILITY_MESSAGE,
  FACILITY_STAFF_MESSAGE,
  USER_MESSAGE,
  FEEDBACK_MESSAGE,
  HEALTH_CHECK_MESSAGE,
  BLOOD_INVENTORY_MESSAGE,
  EMERGENCY_CAMPAIGN_MESSAGE,
};
