const schedule = require("node-schedule");
const bloodRequestModel = require("../models/bloodRequest.model");
const { BLOOD_REQUEST_STATUS } = require("../constants/enum");
const dayjs = require("dayjs");

async function cancelExpiredRequests() {
    const JOB_ID = "CHECK_EXPIRED_REGISTRATION_JOB";
    console.log(`[${JOB_ID}] Starting job...`);
    const yesterday = dayjs().subtract(1, "day").toDate();

    try {
        const result = await bloodRequestModel.updateMany(
            {
                scheduledDeliveryDate: { $lt: yesterday },
                status: BLOOD_REQUEST_STATUS.APPROVED
            },
            {
                $set: {
                    status: BLOOD_REQUEST_STATUS.CANCELLED,
                    note: 'Tự động hủy do quá hạn ngày hẹn'
                }
            }
        );
        console.log(`[${JOB_ID}] Job completed - Success: ${result.modifiedCount}, Errors: ${result.modifiedCount}, Total: ${result.modifiedCount}`);
    } catch (error) {
        console.error(`[${JOB_ID}] Error cancelling expired requests:`, error);
    }
}

module.exports = cancelExpiredRequests;
