"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { EMERGENCY_CAMPAIGN_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const emergencyCampaignService = require("../services/emergencyCampaign.service");

class EmergencyCampaignController {
  createEmergencyCampaign = asyncHandler(async (req, res, next) => {
    const result = await emergencyCampaignService.createEmergencyCampaign(req.user.userId, req.body);
    new CREATED({ message: EMERGENCY_CAMPAIGN_MESSAGE.CREATE_SUCCESS, data: result }).send(res);
  });

  getAllEmergencyCampaigns = asyncHandler(async (req, res, next) => {
    const result = await emergencyCampaignService.getAllEmergencyCampaigns();
    new OK({ message: EMERGENCY_CAMPAIGN_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getEmergencyCampaignById = asyncHandler(async (req, res, next) => {
    const result = await emergencyCampaignService.getEmergencyCampaignById(req.params.id);
    new OK({ message: EMERGENCY_CAMPAIGN_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });

  getFacilityEmergencyCampaigns = asyncHandler(async (req, res, next) => {
    const result = await emergencyCampaignService.getFacilityEmergencyCampaigns(req.params.id);
    new OK({ message: EMERGENCY_CAMPAIGN_MESSAGE.GET_SUCCESS, data: result }).send(res);
  });
}

module.exports = new EmergencyCampaignController();
