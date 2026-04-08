import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['upi', 'bank'], required: true },
  upiId: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
