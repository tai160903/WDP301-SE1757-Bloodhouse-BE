const schedule = require("node-schedule");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");
const dayjs = require("dayjs");

async function cancelExpiredDonations() {
  const JOB_ID = "CHECK_EXPIRED_DONATIONS_JOB";
  console.log(`[${JOB_ID}] Starting job...`);
  const yesterday = dayjs().subtract(1, "day").toDate();

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
    console.log(`[${JOB_ID}] Job completed - Success: ${result.modifiedCount}, Errors: ${result.modifiedCount}, Total: ${result.modifiedCount}`);
  } catch (error) {
    console.error(`[${JOB_ID}] Error cancelling expired donations:`, error);
  }
}

module.exports = cancelExpiredDonations;
