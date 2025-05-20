"use strict";

const bloodGroupModel = require("../models/bloodGroup.model");

class BloodGroupService {
  createBloodGroup = async ({
    name,
    note,
    characteristics,
    populationRate,
  }) => {
    const bloodGroup = await bloodGroupModel.create({
      name,
      note,
      characteristics,
      populationRate,
    });
    return bloodGroup;
  };

  getBloodGroups = async () => {
    const bloodGroups = await bloodGroupModel.find();
    return bloodGroups;
  };

  getBloodGroupPositive = async () => {
    const bloodGroups = await bloodGroupModel.find({
      name: { $in: ["A+", "B+", "O+", "AB+"] },
    });
    return bloodGroups;
  };

  updateBloodGroup = async (
    id,
    { name, note, characteristics, populationRate }
  ) => {
    const bloodGroup = await bloodGroupModel.findByIdAndUpdate(
      id,
      { name, note, characteristics, populationRate },
      { new: true }
    );
    return bloodGroup;
  };
}

module.exports = new BloodGroupService();
