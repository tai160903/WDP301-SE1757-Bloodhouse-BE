"use strict";

const bloodComponentModel = require("../models/bloodComponent.model");

class BloodComponentService {
  createBloodComponent = async ({ name }) => {
    const bloodComponent = await bloodComponentModel.create({ name });
    return bloodComponent;
  }

  getBloodComponents = async () => {
    const bloodComponents = await bloodComponentModel.find();
    return bloodComponents;
  }

  updateBloodComponent = async (id, { name }) => {
    const bloodComponent = await bloodComponentModel.findByIdAndUpdate(id, { name }, { new: true });
    return bloodComponent;
  }
}

module.exports = new BloodComponentService();