import mongoose from 'mongoose';

const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    matchName: String,
    question: String,
    selectedOption: String,
    playingTeam: String,
    score: String,
    amount: Number,
    result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
    odds: { type: Number },
    profit: { type: Number, default: 0 },
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

const Bet = mongoose.model('Bet', betSchema);
export default Bet;
