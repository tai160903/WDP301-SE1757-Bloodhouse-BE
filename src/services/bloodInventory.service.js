"use strict";

const bloodGroupModel = require("../models/bloodGroup.model");
const bloodInventoryModel = require("../models/bloodInventory.model");
const facilityModel = require("../models/facility.model");
const bloodComponentModel = require("../models/bloodComponent.model");
const { FACILITY_MESSAGE } = require("../constants/message");

class BloodInventoryService {
  createBloodInventory = async ({
    facilityId,
    componentId,
    groupId,
    totalQuantity,
  }) => {
    if (!facilityId || !componentId || !groupId || !totalQuantity) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    const facility = await facilityModel.findById(facilityId);
    if (!facility) {
      throw new Error("Cơ sở không tồn tại");
    }

    const component = await bloodComponentModel.findById(componentId);
    if (!component) {
      throw new Error("Thành phần máu không tồn tại");
    }

    const group = await bloodGroupModel.findById(groupId);
    if (!group) {
      throw new Error("Nhóm máu không tồn tại");
    }

    const bloodInventory = await bloodInventoryModel.create({
      facilityId,
      componentId,
      groupId,
      totalQuantity,
    });
    return bloodInventory;
  };

  getBloodInventory = async () => {
    const bloodInventory = await bloodInventoryModel.find();
    return bloodInventory;
  };

  getBloodInventoryByFacilityId = async (facilityId) => {
    const facility = await facilityModel.findById(facilityId);
    if (!facility) {
      throw new Error(FACILITY_MESSAGE.FACILITY_NOT_FOUND);
    }
    const bloodInventory = await bloodInventoryModel
      .find({ facilityId })
      .populate("groupId", "name")
      .populate("componentId", "name");
    return bloodInventory;
  };

  getBloodInventoryByFacilityIdAvailable = async (
    facilityId,
    { groupId, componentId }
  ) => {
    if (!groupId || !componentId) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    const bloodInventory = await bloodInventoryModel.findOne({
      facilityId,
      groupId,
      componentId,
    });
    if (!bloodInventory) {
      return {
        totalQuantity: 0,
      };
    }
    return bloodInventory;
  };
}

module.exports = new BloodInventoryService();
