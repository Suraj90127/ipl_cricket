import mongoose from 'mongoose';

const withdrawHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'upi' },
    upiId: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String }
  },
  { timestamps: true }
);

const WithdrawHistory = mongoose.model('WithdrawHistory', withdrawHistorySchema);
export default WithdrawHistory;
