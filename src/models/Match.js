import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    teamA: String,
    teamB: String,
    teamALogo: String,
    teamBLogo: String,
    matchTime: Date,
    status: { type: String, enum: ['live', 'upcoming', 'finished'], default: 'upcoming' },
    teamAScore: { type: String, default: '' },
    teamBScore: { type: String, default: '' },
    playingTeam: { type: String, default: '' }
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);
export default Match;
