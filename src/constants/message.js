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

const BLOOD_REQUEST_SUPPORT_MESSAGE = {
  GET_SUCCESS: "Lấy danh sách đăng ký giúp đỡ thành công",
  GET_FAILED: "Lấy danh sách đăng ký giúp đỡ thất bại",
  CREATE_SUCCESS: "Đăng ký yêu cầu hỗ trợ thành công",
  CREATE_FAILED: "Đăng ký yêu cầu hỗ trợ thất bại",
  UPDATE_SUCCESS: "Cập nhật yêu cầu hỗ trợ thành công",
  UPDATE_FAILED: "Cập nhật yêu cầu hỗ trợ thất bại",
};

const BLOOD_INVENTORY_MESSAGE = {
  CREATE_SUCCESS: "Tạo tương hợp máu thành công",
  CREATE_FAILED: "Tạo tương hợp máu thất bại",
  UPDATE_SUCCESS: "Cập nhật tương hợp máu thành công",
  UPDATE_FAILED: "Cập nhật tương hợp máu thất bại",
  GET_SUCCESS: "Lấy kho máu thành công",
  GET_FAILED: "Lấy kho máu thất bại",
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
  BLOOD_DONATION_REGISTRATION_NOT_FOUND: "Đăng ký hiến máu không tồn tại",
  INVALID_STATUS: "Trạng thái không hợp lệ",
  STAFF_ID_REQUIRED: "Mã nhân viên không được để trống khi phê duyệt đăng ký",
  FAILED_TO_GENERATE_QR_CODE: "Lỗi khi tạo QR code",
  CHECK_IN_SUCCESS: "Check-in thành công",
  CHECK_IN_FAILED: "Check-in thất bại",
  GET_STATISTICS_SUCCESS: "Lấy thống kê thành công",
  GET_STATISTICS_FAILED: "Lấy thống kê thất bại",
};

const NOTIFICATION_MESSAGE = {
  GET_SUCCESS: "Lấy thông báo thành công",
  GET_FAILED: "Lấy thông báo thất bại",
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
  GET_SUCCESS: "Lấy nội dung thành công",
  GET_FAILED: "Lấy nội dung thất bại",
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
  GET_FACILITY_STATS_SUCCESS: "Lấy thống kê cơ sở thành công",
  GET_FACILITY_STATS_FAILED: "Lấy thống kê cơ sở thất bại",
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
  USER_HAS_PENDING_REGISTRATION:
    "Bạn đã có một đăng ký hiến máu đang chờ xử lý",
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
  GET_REQUEST_BLOOD_NEED_SUPPORT_SUCCESS:
    "Lấy danh sách yêu cầu máu cần hỗ trợ thành công",
  GET_REQUEST_BLOOD_NEED_SUPPORT_BY_ID_SUCCESS:
    "Lấy chi tiết yêu cầu máu cần hỗ trợ thành công",
  GET_SUPPORT_REQUESTS_FOR_FACILITY_SUCCESS:
    "Lấy danh sách yêu cầu cần hỗ trợ của cơ sở thành công",
  ASSIGN_BLOOD_UNITS_TO_REQUEST_SUCCESS:
    "Gán đơn vị máu thành công và tạo đơn vị vận chuyển thành công",
  ASSIGN_BLOOD_UNITS_TO_REQUEST_FAILED:
    "Gán đơn vị máu thất bại hoặc tạo đơn vị vận chuyển thất bại",
  FAILED_TO_GENERATE_QR_CODE: "Lỗi khi tạo QR code",
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

const DONATION_PROCESS_LOG_MESSAGE = {
  CREATE_SUCCESS: "Tạo log thành công",
  CREATE_FAILED: "Tạo log thất bại",
  GET_SUCCESS: "Lấy log thành công",
  GET_FAILED: "Lấy log thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết log thành công",
  GET_DETAIL_FAILED: "Lấy chi tiết log thất bại",
  REGISTRATION_ID_REQUIRED_OR_INVALID: "ID đăng ký hiến máu không hợp lệ",
  REGISTRATION_NOT_FOUND: "Đăng ký hiến máu không tồn tại",
  STATUS_REQUIRED_OR_INVALID: "Trạng thái không hợp lệ",
  CHANGED_BY_REQUIRED_OR_INVALID: "Mã nhân viên không hợp lệ",
  NOTES_REQUIRED_OR_INVALID: "Ghi chú không hợp lệ",
};

const BLOOD_DONATION_PROCESS_MESSAGE = {
  CREATE_SUCCESS: "Tạo quy trình thành công",
  CREATE_FAILED: "Tạo quy trình thất bại",
  GET_SUCCESS: "Lấy quy trình thành công",
  GET_FAILED: "Lấy quy trình thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết quy trình thành công",
  NOTE_REGISTRATION_CREATED: "Đã tạo đăng ký hiến máu",
};

const DONOR_STATUS_LOG_MESSAGE = {
  CREATE_SUCCESS: "Tạo bản ghi trạng thái thành công",
  CREATE_FAILED: "Tạo bản ghi trạng thái thất bại",
  GET_SUCCESS: "Lấy bản ghi trạng thái thành công",
  GET_FAILED: "Lấy bản ghi trạng thái thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết bản ghi trạng thái thành công",
  UPDATE_SUCCESS: "Cập nhật bản ghi trạng thái thành công",
};

const BLOOD_DONATION_MESSAGE = {
  CREATE_SUCCESS: "Tạo hiến máu thành công",
  CREATE_FAILED: "Tạo hiến máu thất bại",
  GET_SUCCESS: "Lấy hiến máu thành công",
  GET_FAILED: "Lấy hiến máu thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết hiến máu thành công",
  GET_DETAIL_FAILED: "Lấy chi tiết hiến máu thất bại",
  UPDATE_SUCCESS: "Cập nhật hiến máu thành công",
  UPDATE_FAILED: "Cập nhật hiến máu thất bại",
  TRANSITION_TO_RESTING_SUCCESS: "Chuyển sang giai đoạn nghỉ ngơi thành công",
  TRANSITION_TO_RESTING_FAILED: "Chuyển sang giai đoạn nghỉ ngơi thất bại",
};

const BLOOD_UNIT_MESSAGE = {
  CREATE_SUCCESS: "Tạo blood units thành công",
  CREATE_FAILED: "Tạo blood units thất bại",
  UPDATE_SUCCESS: "Cập nhật blood unit thành công",
  UPDATE_FAILED: "Cập nhật blood unit thất bại",
  GET_SUCCESS: "Lấy blood units thành công",
  GET_FAILED: "Lấy blood units thất bại",
  GET_DETAIL_SUCCESS: "Lấy chi tiết blood unit thành công",
  GET_DETAIL_FAILED: "Lấy chi tiết blood unit thất bại",
  GET_STATISTICS_SUCCESS: "Lấy thống kê blood units thành công",
  GET_STATISTICS_FAILED: "Lấy thống kê blood units thất bại",
  BLOOD_UNIT_NOT_FOUND: "Blood unit không tồn tại",
  INVALID_STATUS: "Trạng thái blood unit không hợp lệ",
  INVALID_COMPONENT: "Thành phần máu không hợp lệ",
  DONATION_NOT_COMPLETED:
    "Chỉ có thể tạo blood units từ donation đã hoàn thành",
};

const GIFT_MESSAGE = {
  // Gift Items
  GIFT_ITEM_CREATE_SUCCESS: "Tạo loại quà tặng thành công",
  GIFT_ITEM_CREATE_FAILED: "Tạo loại quà tặng thất bại",
  GIFT_ITEM_UPDATE_SUCCESS: "Cập nhật loại quà tặng thành công",
  GIFT_ITEM_UPDATE_FAILED: "Cập nhật loại quà tặng thất bại",
  GIFT_ITEM_DELETE_SUCCESS: "Xóa loại quà tặng thành công",
  GIFT_ITEM_DELETE_FAILED: "Xóa loại quà tặng thất bại",
  GIFT_ITEM_GET_SUCCESS: "Lấy danh sách loại quà tặng thành công",
  GIFT_ITEM_GET_FAILED: "Lấy danh sách loại quà tặng thất bại",
  GIFT_ITEM_NOT_FOUND: "Loại quà tặng không tồn tại",

  // Gift Packages
  GIFT_PACKAGE_CREATE_SUCCESS: "Tạo gói quà tặng thành công",
  GIFT_PACKAGE_CREATE_FAILED: "Tạo gói quà tặng thất bại",
  GIFT_PACKAGE_UPDATE_SUCCESS: "Cập nhật gói quà tặng thành công",
  GIFT_PACKAGE_UPDATE_FAILED: "Cập nhật gói quà tặng thất bại",
  GIFT_PACKAGE_DELETE_SUCCESS: "Xóa gói quà tặng thành công",
  GIFT_PACKAGE_DELETE_FAILED: "Xóa gói quà tặng thất bại",
  GIFT_PACKAGE_GET_SUCCESS: "Lấy danh sách gói quà tặng thành công",
  GIFT_PACKAGE_GET_FAILED: "Lấy danh sách gói quà tặng thất bại",
  GIFT_PACKAGE_NOT_FOUND: "Gói quà tặng không tồn tại",

  // Gift Inventory
  GIFT_INVENTORY_ADD_SUCCESS: "Thêm quà tặng vào kho thành công",
  GIFT_INVENTORY_ADD_FAILED: "Thêm quà tặng vào kho thất bại",
  GIFT_INVENTORY_UPDATE_SUCCESS: "Cập nhật kho quà tặng thành công",
  GIFT_INVENTORY_UPDATE_FAILED: "Cập nhật kho quà tặng thất bại",
  GIFT_INVENTORY_DELETE_SUCCESS: "Xóa quà tặng khỏi kho thành công",
  GIFT_INVENTORY_DELETE_FAILED: "Xóa quà tặng khỏi kho thất bại",
  GIFT_INVENTORY_FETCH_SUCCESS: "Lấy kho quà tặng thành công",
  GIFT_INVENTORY_FETCH_FAILED: "Lấy kho quà tặng thất bại",
  GIFT_INVENTORY_NOT_FOUND: "Quà tặng không có trong kho",
  GIFT_INVENTORY_INSUFFICIENT_QUANTITY: "Số lượng quà tặng trong kho không đủ",

  // Gift Distribution
  GIFT_DISTRIBUTION_SUCCESS: "Phân phát quà tặng thành công",
  GIFT_DISTRIBUTION_FAILED: "Phân phát quà tặng thất bại",
  GIFT_DISTRIBUTION_GET_SUCCESS: "Lấy danh sách phân phát quà tặng thành công",
  GIFT_DISTRIBUTION_GET_FAILED: "Lấy danh sách phân phát quà tặng thất bại",
  GIFT_DISTRIBUTION_NOT_FOUND: "Bản ghi phân phát quà tặng không tồn tại",
  GIFT_ALREADY_DISTRIBUTED: "Quà tặng đã được phân phát cho lần hiến máu này",

  // Gift Package Distribution
  GIFT_PACKAGE_DISTRIBUTION_SUCCESS: "Phân phát gói quà tặng thành công",
  GIFT_PACKAGE_DISTRIBUTION_FAILED: "Phân phát gói quà tặng thất bại",
  GIFT_PACKAGE_INSUFFICIENT_INVENTORY: "Không đủ quà tặng trong kho để phân phát gói này",

  // Gift Budget
  BUDGET_UPDATE_SUCCESS: "Cập nhật ngân sách quà tặng thành công",
  BUDGET_UPDATE_FAILED: "Cập nhật ngân sách quà tặng thất bại",
  BUDGET_GET_SUCCESS: "Lấy thông tin ngân sách thành công",
  BUDGET_GET_FAILED: "Lấy thông tin ngân sách thất bại",
  BUDGET_INSUFFICIENT: "Ngân sách không đủ cho thao tác này",
  BUDGET_NOT_FOUND: "Không tìm thấy ngân sách cho cơ sở này",

  // Gift Reports & Logs
  REPORT_FETCH_SUCCESS: "Lấy báo cáo phân phát quà tặng thành công",
  REPORT_FETCH_FAILED: "Lấy báo cáo phân phát quà tặng thất bại",
  LOG_CREATE_SUCCESS: "Ghi log hoạt động quà tặng thành công",
  LOG_GET_SUCCESS: "Lấy lịch sử hoạt động quà tặng thành công",

  // General
  INVALID_GIFT_DATA: "Dữ liệu quà tặng không hợp lệ",
  UNAUTHORIZED_GIFT_ACCESS: "Không có quyền truy cập chức năng quà tặng này",
  GIFT_OPERATION_FAILED: "Thao tác quà tặng thất bại",
};

const BLOOD_DELIVERY_MESSAGE = {
  GET_SUCCESS: "Lấy thông tin vận chuyển thành công",
  GET_FAILED: "Lấy thông tin vận chuyển thất bại",
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
  NOTIFICATION_MESSAGE,
  DONATION_PROCESS_LOG_MESSAGE,
  BLOOD_DONATION_PROCESS_MESSAGE,
  DONOR_STATUS_LOG_MESSAGE,
  BLOOD_DONATION_MESSAGE,
  BLOOD_UNIT_MESSAGE,
  BLOOD_REQUEST_SUPPORT_MESSAGE,
  GIFT_MESSAGE,
  BLOOD_DELIVERY_MESSAGE,
};
