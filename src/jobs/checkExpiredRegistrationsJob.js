const schedule = require("node-schedule");
const bloodRequestModel = require("../models/bloodRequest.model");
const { BLOOD_REQUEST_STATUS } = require("../constants/enum");

async function cancelExpiredRequests() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    try {
        const result = await bloodRequestModel.updateMany(
            {
                scheduleDate: { $lt: yesterday },
                status: BLOOD_REQUEST_STATUS.APPROVED
            },
            {
                $set: {
                    status: BLOOD_REQUEST_STATUS.CANCELLED,
                    note: 'Tự động hủy do quá hạn ngày hẹn'
                }
            }
        );
        console.log(`Đã hủy ${result.modifiedCount} yêu cầu máu hết hạn`);
    } catch (error) {
        console.error('Error cancelling expired requests:', error);
  }
}

module.exports = cancelExpiredRequests;
