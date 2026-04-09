const UpiSettings = require("../models/upiSettingsModel");

// Get UPI Details
exports.getUpiDetails = async (req, res) => {
  try {
    const upi = await UpiSettings.findOne();

    if (!upi) {
      return res.status(404).json({
        success: false,
        message: "UPI details not found",
      });
    }

    res.status(200).json({
      success: true,
      data: upi,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or Update UPI (Admin)
exports.updateUpiDetails = async (req, res) => {
  try {
    const { upiId, upiName } = req.body;

    if (!upiId || !upiName) {
      return res.status(400).json({
        success: false,
        message: "UPI ID and UPI Name are required",
      });
    }

    let upi = await UpiSettings.findOne();

    if (upi) {
      upi.upiId = upiId;
      upi.upiName = upiName;
      await upi.save();
    } else {
      upi = await UpiSettings.create({ upiId, upiName });
    }

    res.status(200).json({
      success: true,
      message: "UPI details updated successfully",
      data: upi,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};