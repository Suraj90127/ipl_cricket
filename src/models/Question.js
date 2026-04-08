import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    label: String,
    odds: Number
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categoryName: String,
    question: String,
    options: [optionSchema],
    status: { type: String, default: 'open' },
    timerSeconds: { type: Number, default: null },
    autoLockBeforeMinutes: { type: Number, default: null },
    autoCloseAt: { type: Date, default: null },
    isSystemQuestion: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
