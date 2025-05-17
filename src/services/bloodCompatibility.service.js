"use strict";

const bloodCompatibilityModel = require("../models/bloodCompatibility.model");

class BloodCompatibilityService {
  createBloodCompatibility = async ({
    bloodGroupId,
    componentId,
    canDonateTo,
    canReceiveFrom,
  }) => {
    const bloodCompatibility = await bloodCompatibilityModel.create({
      bloodGroupId,
      componentId,
      canDonateTo,
      canReceiveFrom,
    });
    return bloodCompatibility;
  };

  getBloodCompatibilities = async (query) => {
    const bloodCompatibilities = await bloodCompatibilityModel
      .findOne({ bloodGroupId: query.bloodGroupId, componentId: query.componentId })
      .populate(
        "canDonateTo",
        "-__v -bloodGroupId -componentId -createdAt -updatedAt -note -populationRate -characteristics"
      )
      .populate(
        "canReceiveFrom",
        "-__v -bloodGroupId -componentId -createdAt -updatedAt -note -populationRate -characteristics"
      )
      .select("-_id -__v -bloodGroupId -componentId -createdAt -updatedAt");
    return bloodCompatibilities;
  };
}

module.exports = new BloodCompatibilityService();
