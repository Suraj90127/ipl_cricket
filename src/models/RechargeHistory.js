import mongoose from 'mongoose';

const rechargeHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now },
    utrId: {
      type: String,
      sparse: true , // allow null values for other transactions
      unique: true // duplicate UTR block karega
    },

  },
  { timestamps: true }
);

const RechargeHistory = mongoose.model('RechargeHistory', rechargeHistorySchema);
export default RechargeHistory;
