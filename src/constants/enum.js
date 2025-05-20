const USER_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  STAFF: "MANAGER",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  GUEST: "GUEST",
};

const STAFF_POSITION = {
  MANAGER: "MANAGER",
  NURSE: "NURSE",
  DOCTOR: "DOCTOR",
};

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-refresh-token",
};


const BLOOD_GROUP = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

const SEX = {
  MALE: "male",
  FEMALE: "female",
};

const BLOOD_COMPONENT = {
  WHOLE: "Máu toàn phần",
  RED_CELLS: "Hồng cầu",
  PLASMA: "Huyết tương",
  PLATELETS: "Tiểu cầu",
};
const REPORT_TYPE = {
  BLOOD_INVENTORY: "blood_inventory",
  DONATION_SUMMARY: "donation_summary",
  URGENT_REQUESTS: "urgent_requests",
};

const BLOOD_DONATION_REGISTRATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const BLOOD_DONATION_REGISTRATION_SOURCE = {
  VOLUNTARY: "Tự nguyện",
  REQUEST: "Yêu cầu",
};

const BLOOD_DONATION_STATUS = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const BLOOD_DONATION_MESSAGE = {
  CREATE_SUCCESS: "Create blood donation successfully",
  CREATE_FAILED: "Create blood donation failed",
  GET_SUCCESS: "Get blood donation successfully",
  GET_FAILED: "Get blood donation failed",
  GET_DETAIL_SUCCESS: "Get blood donation detail successfully",
  GET_DETAIL_FAILED: "Get blood donation detail failed",
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
};

const CONTENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

const BLOOD_REQUEST_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

module.exports = {
  USER_ROLE,
  STAFF_POSITION,
  HEADER,
  BLOOD_GROUP,
  SEX,
  BLOOD_COMPONENT,
  REPORT_TYPE,
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_DONATION_REGISTRATION_SOURCE,
  USER_STATUS,
  BLOOD_DONATION_STATUS,
  BLOOD_DONATION_MESSAGE,
  CONTENT_STATUS,
  BLOOD_REQUEST_STATUS,
};
