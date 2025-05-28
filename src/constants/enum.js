const USER_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  MANAGER: "MANAGER",
  DOCTOR: "DOCTOR",
  NURSE: "NURSE",
  GUEST: "GUEST",
};

const STAFF_POSITION = {
  MANAGER: "MANAGER",
  NURSE: "NURSE",
  DOCTOR: "DOCTOR",
};

const NOTIFICATION_TYPE = {
  REMINDER: "reminder",
  REQUEST: "request",
  MATCH: "match",
  STATUS: "status",
  GIFT: "gift",
  SUPPORT_REQUEST: "supportRequest",
};

const ENTITY_TYPE = {
  BLOOD_DONATION_REGISTRATION: "bloodDonationRegistration",
  BLOOD_DONATION: "bloodDonation",
  BLOOD_REQUEST: "bloodRequest",
  BLOOD_GROUP: "bloodGroup",
  BLOOD_INVENTORY: "bloodInventory",
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
  OTHER: "other",
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
  PENDING_APPROVAL: "pending_approval",
  REJECTED_REGISTRATION: "rejected_registration",
  REGISTERED: "registered",
  CHECKED_IN: "checked_in",
  IN_CONSULT: "in_consult",
  REJECTED: "rejected",
  WAITING_DONATION: "waiting_donation",
  DONATING: "donating",
  DONATED: "donated",
  RESTING: "resting",
  POST_REST_CHECK: "post_rest_check",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const BLOOD_DONATION_REGISTRATION_SOURCE = {
  VOLUNTARY: "Tự nguyện",
  REQUEST: "Yêu cầu",
};

const BLOOD_DONATION_STATUS = {
  DONATING: "donating",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};


const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
};

const PROFILE_LEVEL = {
  BASIC: 1,
  VERIFIED_CCCD: 2,
}

const CONTENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

const BLOOD_REQUEST_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  REJECTED_REGISTRATION: "rejected_registration",
  APPROVED: "approved",
  ASSIGNED: "assigned",
  READY_FOR_HANDOVER: "ready_for_handover",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const DONOR_STATUS = {
  STABLE: "stable",
  FATIGUED: "fatigued",
  NEEDS_MONITORING: "needs_monitoring",
  OTHER: "other",
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
  CONTENT_STATUS,
  BLOOD_REQUEST_STATUS,
  NOTIFICATION_TYPE,
  ENTITY_TYPE,
  DONOR_STATUS,
  PROFILE_LEVEL,
};
