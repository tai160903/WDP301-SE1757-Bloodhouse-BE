const schedule = require("node-schedule");
const cancelExpiredRequests = require("../jobs/checkExpiredRegistrationsJob");
const cancelExpiredDonations = require("../jobs/checkExpiredDonationsJob");

function initJobScheduler() {
  // JOB-01: Hủy yêu cầu máu hết hạn (mỗi ngày lúc 0h)
  schedule.scheduleJob("0 0 * * *", cancelExpiredRequests);

  // JOB-02: Hủy đơn đăng ký hiến máu hết hạn (mỗi ngày lúc 0h)
  schedule.scheduleJob("0 0 * * *", cancelExpiredDonations);
}

// Chạy lại job mỗi lần chạy server
function runManually() {
  cancelExpiredRequests();
  cancelExpiredDonations();
}

module.exports = { initJobScheduler, runManually };
