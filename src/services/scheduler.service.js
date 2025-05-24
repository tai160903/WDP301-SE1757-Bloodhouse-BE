const schedule = require('node-schedule');
const bloodDonationRegistrationModel = require('../models/bloodDonationRegistration.model');
const bloodRequestModel = require('../models/bloodRequest.model');
const { BLOOD_DONATION_REGISTRATION_STATUS, BLOOD_REQUEST_STATUS } = require('../constants/enum');

class SchedulerService {
    constructor() {
        // Chạy lại 1 lần mỗi giờ để kiểm tra và hủy các đơn đăng ký và yêu cầu máu hết hạn
        this.job = schedule.scheduleJob('0 * * * *', async () => {
            await this.cancelExpiredDonations();
            await this.cancelExpiredRequests();
        });
    }

    async cancelExpiredDonations() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        try {
            const result = await bloodDonationRegistrationModel.updateMany(
                {
                    preferredDate: { $lt: yesterday },
                    status: BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED
                },
                {
                    $set: {
                        status: BLOOD_DONATION_REGISTRATION_STATUS.CANCELLED,
                        notes: 'Tự động hủy do quá hạn ngày hiến máu'
                    }
                }
            );
            console.log(`Đã hủy ${result.modifiedCount} đơn đăng ký hiến máu hết hạn`);
        } catch (error) {
            console.error('Error cancelling expired donations:', error);
        }
    }

    async cancelExpiredRequests() {
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

    // Phương thức để kích hoạt job
    async runManually() {
        await this.cancelExpiredDonations();
        await this.cancelExpiredRequests();
    }
}

module.exports = new SchedulerService(); 