import mongoose from "mongoose";

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

const UpiSettings = mongoose.model("UpiSettings", upiSettingsSchema);

export default UpiSettings;