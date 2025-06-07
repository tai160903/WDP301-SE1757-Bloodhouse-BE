"use strict";

const { default: mongoose } = require("mongoose");
const {
  BLOOD_DELIVERY_STATUS,
  BLOOD_UNIT_STATUS,
  BLOOD_REQUEST_STATUS,
} = require("../constants/enum");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const bloodDeliveryModel = require("../models/bloodDelivery.model");
const bloodRequestModel = require("../models/bloodRequest.model");
const userStaffModel = require("../models/facilityStaff.model");
const userModel = require("../models/user.model");
const bloodUnitModel = require("../models/bloodUnit.model");

class BloodDeliveryService {
  getBloodDeliveryByRequestId = async (requestId, userId) => {
    const bloodDelivery = await bloodDeliveryModel
      .findOne({
        bloodRequestId: requestId,
      })
      .populate("facilityId")
      .populate("bloodRequestId");

    const transporterStaff = await userStaffModel
      .findById(bloodDelivery.transporterId)
      .populate("userId", "fullName");

    bloodDelivery.transporterId = transporterStaff;
    return bloodDelivery;
  };

  getBloodDeliveryById = async (deliveryId) => {
    const bloodDelivery = await bloodDeliveryModel
      .findById(deliveryId)
      .populate("facilityId")
      .populate("bloodRequestId");

    const transporterStaff = await userStaffModel
      .findById(bloodDelivery.transporterId)
      .populate("userId", "fullName avatar");

    bloodDelivery.transporterId = transporterStaff;
    return bloodDelivery;
  };

  getAllBloodDeliveriesByTransporterId = async ({
    userId,
    facilityId,
    status,
    page = 1,
    limit = 10,
  }) => {
    const query = { facilityId };
    if (status) query.status = status;

    const userStaff = await userStaffModel.findOne({ userId, facilityId });
    if (!userStaff) {
      throw new Error("User not found");
    } else {
      query.transporterId = userStaff._id;
    }

    const result = await getPaginatedData({
      model: bloodDeliveryModel,
      query,
      page,
      limit,
      select:
        "_id code facilityToAddress status facilityId bloodRequestId transporterId createdAt updatedAt",
      populate: [
        { path: "facilityId", select: "name address" },
        {
          path: "bloodUnits",
          populate: [
            {
              path: "unitId",
              select: "bloodGroupId componentId",
              populate: [
                {
                  path: "bloodGroupId",
                  select: "name",
                },
                {
                  path: "componentId",
                  select: "name",
                },
              ],
            },
          ],
        },
        {
          path: "bloodRequestId",
          select: "code scheduledDeliveryDate userId",
          populate: {
            path: "userId",
            select: "fullName phone email",
          },
        },
      ],
      sort: { createdAt: -1 },
    });
    return result;
  };

  getBloodDeliveryByIdAndFacilityId = async (deliveryId, facilityId) => {
    const bloodDelivery = await bloodDeliveryModel
      .findOne({
        _id: deliveryId,
        facilityId,
      })
      .populate([
        { path: "facilityId", select: "name address" },
        {
          path: "bloodUnits",
          populate: [
            {
              path: "unitId",
              select: "bloodGroupId componentId code expiresAt",
              populate: [
                {
                  path: "bloodGroupId",
                  select: "name",
                },
                {
                  path: "componentId",
                  select: "name",
                },
              ],
            },
          ],
        },
        {
          path: "bloodRequestId",
          select:
            "code location scheduledDeliveryDate userId patientName patientPhone",
          populate: {
            path: "userId",
            select: "fullName phone email",
          },
        },
      ]);

    const transporterStaff = await userStaffModel
      .findById(bloodDelivery.transporterId)
      .populate("userId", "fullName avatar");

    bloodDelivery.transporterId = transporterStaff;
    return bloodDelivery;
  };

  startDelivery = async (deliveryId, facilityId) => {
    const bloodDelivery = await bloodDeliveryModel.findOneAndUpdate(
      { _id: deliveryId, facilityId },
      {
        status: BLOOD_DELIVERY_STATUS.IN_TRANSIT,
        startDeliveryAt: new Date(),
      }
    );
    if (!bloodDelivery) {
      throw new Error("Blood delivery not found");
    }
    return bloodDelivery;
  };

  completeDelivery = async ({
    deliveryId,
    facilityId,
    recipientId,
    requestId,
    type,
  }) => {
    // Step 0: Tạo session
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (type !== "blood_delivery") {
        throw new Error("Không phải đơn giao hàng máu");
      }
      const bloodDelivery = await bloodDeliveryModel
        .findOne({
          _id: deliveryId,
          facilityId,
          bloodRequestId: requestId,
        })
        .populate([
          {
            path: "bloodRequestId",
            select: "userId",
          },
          {
            path: "bloodUnits",
            select: "unitId quantity",
          },
        ])
        .session(session);

      if (!bloodDelivery) {
        throw new Error("Blood delivery not found");
      }

      if (bloodDelivery.bloodRequestId.userId.toString() !== recipientId) {
        throw new Error("Không phải đơn giao hàng của người nhận");
      }
      if (bloodDelivery.status !== BLOOD_DELIVERY_STATUS.IN_TRANSIT) {
        throw new Error("Đơn giao hàng không ở trạng thái đang giao");
      }

      // Step 1: Cập nhật deliveredQuantity cho mỗi blood unit
      await Promise.all(
        bloodDelivery.bloodUnits.map(async (deliveryItem) => {
          const unit = await bloodUnitModel.findById(deliveryItem.unitId).session(session);
          if (!unit) return;
  
          unit.deliveredQuantity = (unit.deliveredQuantity || 0) + deliveryItem.quantity;
  
          if (unit.deliveredQuantity >= unit.quantity) {
            unit.status = BLOOD_UNIT_STATUS.USED;
          }
  
          await unit.save({ session });
        })
      );

      // Step 2: Cập nhật trạng thái của đơn giao hàng
      bloodDelivery.status = BLOOD_DELIVERY_STATUS.DELIVERED;
      bloodDelivery.deliveredAt = new Date();
      await bloodDelivery.save({ session });

      // Step 3: Cập nhật trạng thái của yêu cầu máu
      const bloodRequest = await bloodRequestModel.findOneAndUpdate(
        { _id: requestId },
        { status: BLOOD_REQUEST_STATUS.COMPLETED }
      ).session(session);

      if (!bloodRequest) {
        throw new Error("Yêu cầu máu không tồn tại");
      }

      await session.commitTransaction();
      return bloodDelivery;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
}

module.exports = new BloodDeliveryService();
