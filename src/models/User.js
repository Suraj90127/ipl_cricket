import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    uid: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    referralCode: String,
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dailyBonus: { type: Number, default: 0 },
    lastDailyClaim: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
