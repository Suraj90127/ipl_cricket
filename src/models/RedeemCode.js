import mongoose from "mongoose";

const redeemCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    // 🔥 NEW FIELD
    totalUsers: {
      type: Number,
      required: true,
    },
    peopleLeft: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RedeemCode", redeemCodeSchema);