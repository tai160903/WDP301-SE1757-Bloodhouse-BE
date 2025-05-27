const schedule = require("node-schedule");
const dayjs = require("dayjs");
const { BLOOD_DONATION_REGISTRATION_STATUS } = require("../constants/enum");
const bloodDonationRegistrationModel = require("../models/bloodDonationRegistration.model");
const notificationService = require("../services/notification.service");

async function reminder1DayBeforeDonationJob() {
  const JOB_ID = "REMINDER_1_DAY_BEFORE_DONATION_JOB";
  console.log(`[${JOB_ID}] Starting reminder job...`);

  try {
    // Calculate time windows
    const now = dayjs();
    const tomorrowStart = now.add(1, "day").startOf("day").toDate();
    const tomorrowEnd = now.add(1, "day").endOf("day").toDate();

    // Fetch upcoming registrations
    const upcomingDonations = await bloodDonationRegistrationModel
      .find({
        preferredDate: {
          $gte: tomorrowStart,
          $lte: tomorrowEnd,
        },
        status: BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
        reminderStatus: {
          oneDay: false,
          twoHours: false,
        },
      })
      .populate("userId");

    if (!upcomingDonations || upcomingDonations.length === 0) {
      console.log(`[${JOB_ID}] No upcoming donations found`);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each donation and create notifications
    for (const donation of upcomingDonations) {
      try {
        const { userId, preferredDate } = donation;
        if (!userId || !userId._id || !preferredDate) {
          console.warn(`[${JOB_ID}] Invalid donation data:`, donation);
          errorCount++;
          continue;
        }

        await notificationService.sendReminderDonationNotification(
          userId._id,
          preferredDate,
          donation._id
        );

        donation.reminderStatus.oneDay = true;
        await donation.save();

        successCount++;
      } catch (notifError) {
        console.error(
          `[${JOB_ID}] Error creating notification for donation ${donation._id}:`,
          notifError
        );
        errorCount++;
      }
    }

    console.log(
      `[${JOB_ID}] Job completed - Success: ${successCount}, Errors: ${errorCount}, Total: ${upcomingDonations.length}`
    );
  } catch (error) {
    console.error(`[${JOB_ID}] Critical error in reminder job:`, error);
    throw error; // Re-throw to allow the scheduler to handle the error
  }
}

async function reminder2HoursBeforeDonationJob() {
  const JOB_ID = "REMINDER_2_HOURS_BEFORE_DONATION_JOB";
  console.log(`[${JOB_ID}] Starting reminder job...`);

  try {
    // Calculate time windows
    const now = dayjs();
    const twoHoursStart = now.add(2, "hours").startOf("hour").toDate();
    const twoHoursEnd = now.add(2, "hours").endOf("hour").toDate();

    const upcomingDonations = await bloodDonationRegistrationModel
      .find({
        preferredDate: {
          $gte: twoHoursStart,
          $lte: twoHoursEnd,
        },
        status: BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
        reminderStatus: {
          oneDay: { $in: [true, false] },
          twoHours: false,
        },
      })
      .populate("userId");

    if (!upcomingDonations || upcomingDonations.length === 0) {
      console.log(`[${JOB_ID}] No upcoming donations found`);
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    for (const donation of upcomingDonations) {
      try {
        const { userId, preferredDate } = donation;
        if (!userId || !userId._id || !preferredDate) { 
          console.warn(`[${JOB_ID}] Invalid donation data:`, donation);
          errorCount++;
          continue;
        }

        await notificationService.sendReminderDonationNotification(
          userId._id,
          preferredDate,
          donation._id
        );

        donation.reminderStatus.twoHours = true;
        await donation.save();

        successCount++;
      } catch (notifError) {
        console.error(
          `[${JOB_ID}] Error creating notification for donation ${donation._id}:`,
          notifError
        );
        errorCount++;
      }
    }

    console.log(
      `[${JOB_ID}] Job completed - Success: ${successCount}, Errors: ${errorCount}, Total: ${upcomingDonations.length}`
    );
  } catch (error) {
    console.error(`[${JOB_ID}] Critical error in reminder job:`, error);
    throw error; // Re-throw to allow the scheduler to handle the error
  }
}

module.exports = {
  reminder1DayBeforeDonationJob,
  reminder2HoursBeforeDonationJob,
};
