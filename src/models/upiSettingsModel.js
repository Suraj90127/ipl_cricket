const mongoose = require("mongoose");

const upiSettingsSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      required: true,
    },
    upiName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UpiSettings", upiSettingsSchema);