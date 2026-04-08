// ...existing code...


import Match from '../models/Match.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import RechargeHistory from '../models/RechargeHistory.js';
import WithdrawHistory from '../models/WithdrawHistory.js';
import { getIO } from '../lib/socket.js';

function buildMatchPayload(body = {}) {
  const payload = { ...body };
  let matchTime = body.matchTime;

  if (!matchTime && body.date) {
    const timePart = body.time || '00:00';
    const composed = `${body.date}T${timePart}`;
    const parsed = new Date(composed);
    if (!Number.isNaN(parsed.getTime())) {
      matchTime = parsed;
    }
  }

  if (matchTime) {
    const parsed = new Date(matchTime);
    if (!Number.isNaN(parsed.getTime())) {
      payload.matchTime = parsed;
    }
  }

  delete payload.date;
  delete payload.time;
  return payload;
}

function normalizeQuestionOptions(options = []) {
  if (!Array.isArray(options)) return [];

  return options
    .map((option) => {
      if (typeof option === 'string') {
        const label = option.trim();
        return label ? { label } : null;
      }

      if (option && typeof option === 'object') {
        const label = String(option.label ?? option.value ?? '').trim();
        if (!label) return null;

        const normalized = { label };
        if (option.odds !== undefined && option.odds !== null && option.odds !== '') {
          const odds = Number(option.odds);
          if (!Number.isNaN(odds)) normalized.odds = odds;
        }
        return normalized;
      }

      return null;
    })
    .filter(Boolean);
}

async function resolveCategory({ categoryId, category, categoryName }) {
  if (categoryId) {
    const existing = await Category.findById(categoryId);
    if (existing) return existing;
  }

  const requestedName = String(categoryName || category || '').trim();
  if (!requestedName) return null;

  let existing = await Category.findOne({ name: requestedName });
  if (!existing) {
    existing = await Category.create({ name: requestedName });
  }
  return existing;
}
export async function adminDeleteQuestion(req, res) {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function ensureMatchWinnerQuestion(match) {
  const existing = await Question.findOne({
    matchId: match._id,
    question: 'Who will win the match?'
  });

  const matchWinnerCategory = await resolveCategory({ categoryName: 'Match Winner' });
  const options = [{ label: match.teamA }, { label: match.teamB }];

  if (existing) {
    existing.categoryId = matchWinnerCategory?._id;
    existing.categoryName = matchWinnerCategory?.name ?? 'Match Winner';
    existing.options = options;
    existing.isSystemQuestion = true;
    await existing.save();
    return existing;
  }

  return Question.create({
    matchId: match._id,
    categoryId: matchWinnerCategory?._id,
    categoryName: matchWinnerCategory?.name ?? 'Match Winner',
    question: 'Who will win the match?',
    options,
    status: 'open',
    isSystemQuestion: true
  });
}

async function buildQuestionPayload(body = {}) {
  const category = await resolveCategory(body);
  const options = normalizeQuestionOptions(body.options);

  return {
    matchId: body.matchId,
    question: String(body.question || '').trim(),
    options,
    status: body.status || 'open',
    categoryId: category?._id,
    categoryName: category?.name ?? String(body.categoryName || body.category || '').trim(),
      timerSeconds: body.timerSeconds !== undefined ? Number(body.timerSeconds) : null
  };
}

// ─── Existing ────────────────────────────────────────────────────────────────

export async function adminAddMatch(req, res) {
  try {
    const payload = buildMatchPayload(req.body);
    const match = await Match.create(payload);
    await ensureMatchWinnerQuestion(match);

    // Toss question auto-create
    const tossCategory = await resolveCategory({ categoryName: 'Toss' });
 
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminAddCategory(req, res) {
  try {
    const cat = await Category.create(req.body);
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminAddQuestion(req, res) {
  try {
    const payload = await buildQuestionPayload(req.body);
    if (!payload.matchId || !payload.question || payload.options.length < 2) {
      return res.status(400).json({ message: 'Match, question, and at least 2 options are required' });
    }

    const question = await Question.create(payload);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminResult(req, res) {
  try {
    const { questionId, winningOption } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // aggregate current pending bets counts per option
    const countsAgg = await Bet.aggregate([
      { $match: { questionId: question._id, result: 'pending' } },
      { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
    ]);
    const counts = {};
    countsAgg.forEach((c) => { counts[c._id] = c.count; });

    const bets = await Bet.find({ questionId, status: 'active', result: 'pending' });
    for (const bet of bets) {
      if (bet.selectedOption === winningOption) {
        bet.result = 'win';
        bet.profit = (bet.amount * (bet.odds ?? 1)) || 0;
        const user = await User.findById(bet.userId);
        if (user) {
          user.balance += bet.profit;
          await user.save();
        }
      } else {
        bet.result = 'loss';
      }
      await bet.save();
    }

    // close the question
    question.status = 'closed';
    await question.save();

    // emit socket event so clients update immediately
    try {
      const io = getIO();
      io?.to(`match:${question.matchId}`).emit('question:result', { questionId: String(questionId), winningOption, counts });
      io?.emit('question:result', { questionId: String(questionId), winningOption, counts });
    } catch (err) {
      console.error('Emit question:result failed', err);
    }

    res.json({ updated: bets.length, counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminGetLiveQuestions(req, res) {
  try {
    // Support optional filters: matchId and templateFilter ('template' | 'non-template')
    let matchIds = [];
    if (req.query.matchId) {
      // If a specific matchId is provided, use it (caller is expected to provide a valid id)
      matchIds = [req.query.matchId];
    } else {
      const liveMatches = await Match.find({ status: 'live' }, '_id');
      matchIds = liveMatches.map((m) => m._id);
      if (!matchIds.length) return res.json({ questions: [] });
    }

    // Auto-close questions that have passed their autoCloseAt time
    const now = new Date();
    const questionsToClose = await Question.updateMany(
      { matchId: { $in: matchIds }, autoCloseAt: { $lte: now }, status: 'open' },
      { $set: { status: 'closed' } }
    );
    
    // Emit socket events for closed questions
    if (questionsToClose.modifiedCount > 0) {
      try {
        const closedQuestions = await Question.find({ matchId: { $in: matchIds }, autoCloseAt: { $lte: now }, status: 'closed' });
        const io = getIO();
        if (io) {
          for (const q of closedQuestions) {
            io.to(`match:${q.matchId}`).emit('question:result', { questionId: String(q._id), message: 'Auto-closed' });
          }
        }
      } catch (err) {
        console.error('Emit auto-close event failed', err);
      }
    }

    // Build question filter (don't restrict to 'open' so questions with pending bets
    // are still returned even if their status was set to 'closed')
    const qFilter = { matchId: { $in: matchIds } };
    if (req.query.templateFilter) {
      if (req.query.templateFilter === 'template') {
        qFilter.autoLockBeforeMinutes = { $ne: null };
      } else if (req.query.templateFilter === 'non-template') {
        qFilter.$and = [
          { $or: [{ autoLockBeforeMinutes: null }, { autoLockBeforeMinutes: { $exists: false } }] },
          { isSystemQuestion: { $ne: true } }
        ];
      }
    }

    const questions = await Question.find(qFilter)
      .populate('matchId', 'teamA teamB')
      .lean();

    const questionIds = questions.map((q) => q._id);
    if (!questionIds.length) return res.json({ questions: [] });

    const agg = await Bet.aggregate([
      { $match: { questionId: { $in: questionIds }, result: 'pending' } },
      { $group: { _id: { questionId: '$questionId', option: '$selectedOption' }, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    const map = new Map();
    for (const q of questions) {
      map.set(String(q._id), { ...q, counts: {}, amounts: {}, totalBets: 0, totalAmount: 0 });
    }

    for (const a of agg) {
      const qid = String(a._id.questionId);
      const opt = a._id.option || '';
      const entry = map.get(qid);
      if (entry) {
        entry.counts[opt] = (entry.counts[opt] || 0) + a.count;
        entry.amounts[opt] = (entry.amounts[opt] || 0) + (a.amount || 0);
        entry.totalBets = (entry.totalBets || 0) + a.count;
        entry.totalAmount = (entry.totalAmount || 0) + (a.amount || 0);
      }
    }
    // Only return questions that have at least one pending bet or amount
    const result = Array.from(map.values()).filter((q) => ((q.totalBets || 0) > 0) || ((q.totalAmount || 0) > 0));
    res.json({ questions: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUpdateScore(req, res) {
  try {
    const { matchId, team, score, status } = req.body;
    if (!['A', 'B'].includes(team)) {
      return res.status(400).json({ message: 'Invalid team. Use "A" or "B".' });
    }
    const update = {};
    if (team === 'A') update.teamAScore = score;
    if (team === 'B') update.teamBScore = score;
    if (status) update.status = status;
    const match = await Match.findByIdAndUpdate(matchId, update, { new: true });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    const io = getIO();
    io?.to(`match:${matchId}`).emit('score:update', { matchId, teamAScore: match.teamAScore, teamBScore: match.teamBScore });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function adminGetStats(req, res) {
  try {
    const [totalUsers, totalBets, liveBets, revenueAgg, withdrawAgg] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Bet.countDocuments(),
      Bet.countDocuments({ status: 'active', result: 'pending' }),
      Transaction.aggregate([{ $match: { type: 'recharge', status: 'done' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'withdraw', status: 'approved' } }, { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }]),
    ]);
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const [betsCount, revenue] = await Promise.all([
        Bet.countDocuments({ createdAt: { $gte: d, $lt: next } }),
        Transaction.aggregate([{ $match: { type: 'recharge', status: 'done', createdAt: { $gte: d, $lt: next } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
      ]);
      last7.push({ date: d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }), bets: betsCount, revenue: revenue[0]?.total ?? 0 });
    }
    res.json({
      totalUsers,
      totalBets,
      liveBets,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      totalWithdrawals: withdrawAgg[0]?.total ?? 0,
      last7
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function adminGetUsers(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const filter = {};
    if (req.query.search) {
      const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }, { phone: re }];
    }
    const [users, total] = await Promise.all([
      User.find(filter, '-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);
    const userIds = users.map((u) => u._id);
    const betCounts = await Bet.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const betMap = new Map(betCounts.map((item) => [item._id.toString(), item.count]));
    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      balance: u.balance ?? 0,
      totalBets: betMap.get(u._id.toString()) ?? 0,
      createdAt: u.createdAt
    }));
    res.json({ users: result, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminBlockUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked', status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUnblockUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked', status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminGetUserDetails(req, res) {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [rechargeHistory, withdrawHistory, bets] = await Promise.all([
      RechargeHistory.find({ userId: user._id }).sort({ date: -1 }).limit(50),
      WithdrawHistory.find({ userId: user._id }).sort({ date: -1 }).limit(50),
      Bet.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50)
    ]);
    res.json({ user, rechargeHistory, withdrawHistory, bets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminAdjustWallet(req, res) {
  try {
    const { amount, type } = req.body; // type: 'add' | 'deduct'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const delta = type === 'deduct' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    user.balance = Math.max(0, (user.balance ?? 0) + delta);
    await user.save();

    // Record transaction: use 'recharge' for credits and 'withdraw' for debits
    const txType = type === 'deduct' ? 'deducted' : 'credited';
    const txAmount = Math.abs(Number(amount));
    const note = `Admin ${type === 'deduct' ? 'deducted' : 'credited'} ${txAmount}`;
    await Transaction.create({ userId: user._id, amount: txAmount, type: txType, status: 'done', note });

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Bets ─────────────────────────────────────────────────────────────────────

export async function adminGetBets(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const filter = {};
    if (req.query.matchId) filter.matchId = req.query.matchId;
    if (req.query.result) filter.result = req.query.result;
    if (req.query.today === 'true') {
      const today = new Date(); today.setHours(0,0,0,0);
      filter.createdAt = { $gte: today };
    }
    const [bets, total] = await Promise.all([
      Bet.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('userId', 'name email phone')
        .populate('matchId', 'teamA teamB')
        .populate('questionId', 'question'),
      Bet.countDocuments(filter)
    ]);
    res.json({ bets, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminGetLiveBets(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const liveMatches = await Match.find({ status: 'live' }, '_id');
    const matchIds = liveMatches.map((m) => m._id);
    const filter = { matchId: { $in: matchIds }, result: 'pending' };
    const [bets, total] = await Promise.all([
      Bet.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('userId', 'name email')
        .populate('matchId', 'teamA teamB score status')
        .populate('questionId', 'question status'),
      Bet.countDocuments(filter)
    ]);
    res.json({ bets, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function adminGetMatches(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const [matches, total] = await Promise.all([
      Match.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Match.countDocuments(filter)
    ]);
    res.json({ matches, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUpdateMatch(req, res) {
  try {
    const payload = buildMatchPayload(req.body);
    const match = await Match.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    await ensureMatchWinnerQuestion(match);
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminDeleteMatch(req, res) {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    // remove all questions tied to this match
    await Question.deleteMany({ matchId: match._id });

    await Match.findByIdAndDelete(match._id);

    // notify connected clients in match room
    try {
      const io = getIO();
      io?.to(`match:${match._id}`).emit('match:deleted', { matchId: match._id });
    } catch (err) {
      console.error('Failed to emit match:deleted', err);
    }

    res.json({ message: 'Match and related questions deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function adminGetQuestions(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const filter = {};
    if (req.query.matchId) filter.matchId = req.query.matchId;
    // templateFilter: 'template' | 'non-template' | undefined
    if (req.query.templateFilter) {
      if (req.query.templateFilter === 'template') {
        // questions created from templates have autoLockBeforeMinutes set
        filter.autoLockBeforeMinutes = { $ne: null };
      } else if (req.query.templateFilter === 'non-template') {
        // without template: autoLockBeforeMinutes is null/absent and not a system question
        filter.$and = [
          { $or: [{ autoLockBeforeMinutes: null }, { autoLockBeforeMinutes: { $exists: false } }] },
          { isSystemQuestion: { $ne: true } }
        ];
      }
    }
    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('matchId', 'teamA teamB'),
      Question.countDocuments(filter)
    ]);
    res.json({ questions, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUpdateQuestion(req, res) {
  try {
    const { id } = req.params;
    const payload = await buildQuestionPayload(req.body);
    console.log("payload",payload)
    const updated = await Question.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: 'Question not found' });
    // Emit socket event for live update
    const io = getIO();
    io?.to(`match:${updated.matchId}`).emit('question:update', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminBulkUpdateQuestions(req, res) {
  try {
    const { matchId, questionIds, updates } = req.body;
    if (!matchId || !updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'matchId and updates required' });
    }

    const filter = { matchId };
    if (Array.isArray(questionIds) && questionIds.length > 0) filter._id = { $in: questionIds };

    // Only allow certain fields to be updated in bulk
    const allowed = ['timerSeconds', 'status', 'autoLockBeforeMinutes', 'autoCloseAt'];
    const set = {};
    allowed.forEach((k) => {
      if (updates[k] !== undefined) {
        if (k === 'autoCloseAt' && updates[k]) {
          set[k] = new Date(updates[k]);
        } else {
          set[k] = updates[k];
        }
      }
    });

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ message: 'No allowed updates provided' });
    }

    await Question.updateMany(filter, { $set: set });
    const updated = await Question.find(filter);

    // Emit individual question updates for realtime clients
    try {
      const io = getIO();
      if (io) {
        for (const q of updated) {
          io.to(`match:${matchId}`).emit('question:update', q);
        }
      }
    } catch (err) {
      console.error('Emit question:update failed', err);
    }

    res.json({ updatedCount: updated.length, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function adminGetTransactions(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    const [txs, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('userId', 'name email phone'),
      Transaction.countDocuments(filter)
    ]);
    res.json({ transactions: txs, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUpdateTransaction(req, res) {
  try {
    const { status } = req.body;
    const tx = await Transaction.findById(req.params.id).populate('userId');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    if (status === 'approved' && tx.type === 'withdraw' && tx.status !== 'approved') {
      // already deducted at request time, just mark approved
    }
    if (status === 'approved' && tx.type === 'recharge' && tx.status !== 'done') {
      const user = await User.findById(tx.userId);
      if (user) { user.balance += Math.abs(tx.amount); await user.save(); }
    }
    if (status === 'rejected' && tx.type === 'withdraw' && tx.status === 'requested') {
      // refund the withdraw amount
      const user = await User.findById(tx.userId);
      if (user) { user.balance += Math.abs(tx.amount); await user.save(); }
    }
    tx.status = status;
    await tx.save();
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
