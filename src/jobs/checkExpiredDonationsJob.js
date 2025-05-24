const schedule = require("node-schedule");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");

async function cancelExpiredDonations() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    const result = await bloodDonationRegistrationModel.updateMany(
      {
        preferredDate: { $lt: yesterday },
        status: BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
      },
      {
        $set: {
          status: BLOOD_DONATION_REGISTRATION_STATUS.CANCELLED,
          notes: "Tự động hủy do quá hạn ngày hiến máu",
        },
      }
    );
    console.log(`Đã hủy ${result.modifiedCount} đơn đăng ký hiến máu hết hạn`);
  } catch (error) {
    console.error("Error cancelling expired donations:", error);
  }
}

module.exports = cancelExpiredDonations;
