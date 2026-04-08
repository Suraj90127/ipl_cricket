import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    bannerEnabled: { type: Boolean, default: false },
    bannerText: { type: String, default: '' },
    bannerImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
