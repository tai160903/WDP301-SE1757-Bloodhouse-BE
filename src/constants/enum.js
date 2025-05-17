const USER_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  STAFF: "STAFF",
  GUEST: "GUEST",
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
  WHOLE: "whole",
  RED_CELLS: "red_cells",
  PLASMA: "plasma",
  PLATELETS: "platelets",
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
  VOLUNTARY: "voluntary",
  REQUEST: "request",
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
};

module.exports = {
  USER_ROLE,
  HEADER,
  BLOOD_GROUP,
  SEX,
  BLOOD_COMPONENT,
  REPORT_TYPE,
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_DONATION_REGISTRATION_SOURCE,
  USER_STATUS,
};
