import mongoose from 'mongoose';
import Bet from '../models/Bet.js';
import Match from '../models/Match.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const betController = (io) => ({
  placeBet: async (req, res) => {
    const { matchId, questionId, selectedOption, amount, odds,score,playingTeam } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    const match = await Match.findById(matchId);
    const question = await Question.findById(questionId);
    if (!match || !question) return res.status(400).json({ message: 'Invalid match/question' });

    user.balance -= amount;
    await user.save();

    const bet = await Bet.create({
      userId: user._id,
      matchId,
      questionId,
      matchName: `${match.teamA} vs ${match.teamB}`,
      question: question.question,
      selectedOption,
      amount,
      odds: odds ?? (() => {
        // fallback: find odds from question.options
        const opt = (question.options || []).find(o => o.label === selectedOption);
        return opt?.odds;
      })(),
      result: 'pending',
      playingTeam,
      score
    });

    await Transaction.create({ userId: user._id, amount: -amount, type: 'bet', status: 'done' });

    io.to(`match:${matchId}`).emit('bet:new', { betId: bet._id });
    io.emit('bet:new', { betId: bet._id }); // admin/global
    res.json({ bet });
  },

  stats: async (req, res) => {
    const userId = req.userId;
    try {
      const [totalBets, wins, losses, winAgg] = await Promise.all([
        Bet.countDocuments({ userId }),
        Bet.countDocuments({ userId, result: 'win' }),
        Bet.countDocuments({ userId, result: 'loss' }),
        Bet.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId), result: 'win' } },
          { $group: { _id: null, total: { $sum: '$profit' } } }
        ])
      ]);

      const winAmount = (winAgg[0] && winAgg[0].total) || 0;
      res.json({ totalBets, wins, losses, winAmount });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  listBets: async (req, res) => {
    const limit = Math.max(1, Number(req.query.limit) || 50);
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = { userId: req.userId };

    const { range } = req.query;
    if (range) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (range === 'today') {
        filter.createdAt = { $gte: startOfToday };
      } else if (range === 'yesterday') {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        filter.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
      } else if (range === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filter.createdAt = { $gte: weekAgo };
      } else if (range === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filter.createdAt = { $gte: monthAgo };
      }
    }

    const [bets, total] = await Promise.all([
      Bet.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Bet.countDocuments(filter)
    ]);

    res.json({
      bets,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    });
  }
});
