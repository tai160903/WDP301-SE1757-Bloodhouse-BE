"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { BLOOD_DELIVERY_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const bloodDeliveryService = require("../services/bloodDelivery.service");

class BloodDeliveryController {
  getBloodDeliveryByRequestId = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const result = await bloodDeliveryService.getBloodDeliveryByRequestId(
      requestId
    );
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getBloodDeliveryById = asyncHandler(async (req, res, next) => {
    const { deliveryId } = req.params;
    const result = await bloodDeliveryService.getBloodDeliveryById(deliveryId);
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllBloodDeliveriesByTransporterId = asyncHandler(
    async (req, res, next) => {
      const { userId } = req.user;
      const { facilityId } = req.params;
      const { status, page, limit } = req.query;
      const result =
        await bloodDeliveryService.getAllBloodDeliveriesByTransporterId({
          userId,
          facilityId,
          status,
          page,
          limit,
        });
      new OK({
        message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
        data: result,
      }).send(res);
    }
  );

  getBloodDeliveryByIdAndFacilityId = asyncHandler(async (req, res, next) => {
    const { deliveryId, facilityId } = req.params;
    const result = await bloodDeliveryService.getBloodDeliveryByIdAndFacilityId(
      deliveryId,
      facilityId
    );
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  startDelivery = asyncHandler(async (req, res, next) => {
    const { deliveryId, facilityId } = req.params;
    const result = await bloodDeliveryService.startDelivery(
      deliveryId,
      facilityId
    );
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  completeDelivery = asyncHandler(async (req, res, next) => {
    const { deliveryId } = req.params;
    const { facilityId, recipientId, requestId, type } = req.body;
    const result = await bloodDeliveryService.completeDelivery({
      deliveryId,
      facilityId,
      recipientId,
      requestId,
      type,
    });
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getDeliveryStatsForTransporter = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const result = await bloodDeliveryService.getDeliveryStatsForTransporter(
      userId
    );
    new OK({
      message: BLOOD_DELIVERY_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new BloodDeliveryController();
