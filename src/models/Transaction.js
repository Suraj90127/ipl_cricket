import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    type: { type: String,  required: true },
    status: { type: String, default: 'pending' },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
