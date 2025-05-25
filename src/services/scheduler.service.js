const schedule = require("node-schedule");
const cancelExpiredRequests = require("../jobs/checkExpiredRegistrationsJob");
const cancelExpiredDonations = require("../jobs/checkExpiredDonationsJob");
const {
  reminder1DayBeforeDonationJob,
  reminder2HoursBeforeDonationJob,
} = require("../jobs/reminderBeforeDonationJob ");

function initJobScheduler() {
  // JOB-01: Hủy yêu cầu máu hết hạn (mỗi ngày lúc 0h)
  schedule.scheduleJob("0 0 * * *", cancelExpiredRequests);

  // JOB-02: Hủy đơn đăng ký hiến máu hết hạn (mỗi ngày lúc 0h)
  schedule.scheduleJob("0 0 * * *", cancelExpiredDonations);

  // JOB-03: Nhắc lịch hiến máu trước 1 ngày (chạy mỗi giờ)
  schedule.scheduleJob("0 * * * *", reminder1DayBeforeDonationJob);

  // JOB-04: Nhắc lịch hiến máu trước 2 giờ (chạy mỗi 10 phút)
  schedule.scheduleJob("*/10 * * * *", reminder2HoursBeforeDonationJob);
}

// Chạy lại job mỗi lần chạy server
function runManually() {
  cancelExpiredRequests();
  cancelExpiredDonations();
  reminder1DayBeforeDonationJob();
  reminder2HoursBeforeDonationJob();
}

module.exports = { initJobScheduler, runManually };
