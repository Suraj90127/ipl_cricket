import Question from '../models/Question.js';
import Category from '../models/Category.js';
import Match from '../models/Match.js';
import { getIO } from '../lib/socket.js';

// 20 "Set & Forget" templates as requested (placeholders will be replaced per match)
const setAndForgetTemplates = [
  { categoryName: 'Toss', question: 'Who will win the toss?', type: 'team', odds: 1.9 },
  { categoryName: 'Other', question: 'What will be the last digit of the first innings total? (Odd / Even)', options: [{ label: 'Odd', odds: 1.9 }, { label: 'Even', odds: 1.9 }] },
  { categoryName: 'Overs', question: 'Total sixes in match - Odd / Even', options: [{ label: 'Odd', odds: 1.9 }, { label: 'Even', odds: 1.9 }] },
  { categoryName: 'Wicket', question: 'Total wickets in match - Odd / Even', options: [{ label: 'Odd', odds: 1.9 }, { label: 'Even', odds: 1.9 }] },
  { categoryName: 'Match Winner', question: 'Which team will bat first?', type: 'team', odds: 1.9 },

  { categoryName: 'First Event', question: 'Which team will hit the first six?', type: 'team', odds: 1.85 },
  { categoryName: 'First Event', question: 'Which team will hit the first four?', type: 'team', odds: 1.85 },
  { categoryName: 'First Event', question: "Which team's player will take the first wicket?", type: 'team', odds: 1.85 },
  { categoryName: 'Powerplay', question: 'Which team will score more runs in Powerplay (1-6)?', type: 'team', odds: 1.85 },
  { categoryName: 'Partnership', question: 'Which team will have the biggest opening partnership?', type: 'team', odds: 1.85 },
  { categoryName: 'Extras', question: 'Which team will give more extras (wide/no-ball)?', type: 'team', odds: 1.85 },

  { categoryName: 'Overs', question: 'Will the first innings total be over 165.5? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },
  { categoryName: 'Powerplay', question: 'Will {teamA} score over 48.5 runs in powerplay (1-6)? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },
  { categoryName: 'Powerplay', question: 'Will {teamB} score over 48.5 runs in powerplay (1-6)? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },
  { categoryName: 'Run', question: 'Will {teamA} lose their first wicket before 22.5 runs? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },
  { categoryName: 'Run', question: 'Will {teamB} lose their first wicket before 22.5 runs? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },

  { categoryName: 'Player H2H', question: 'Which player will score more runs? ({player1} / {player2})', placeholders: ['player1', 'player2'], odds: 1.85 },
  { categoryName: 'Player H2H', question: 'Which bowler will take more wickets? ({bowler1} / {bowler2})', placeholders: ['bowler1', 'bowler2'], odds: 1.85 },
  { categoryName: 'Player', question: 'Will {starBatsman} score over 25.5 runs? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] },
  { categoryName: 'Player', question: 'Will {starBowler} take 2 or more wickets (over 1.5)? (Over / Under)', options: [{ label: 'Over', odds: 1.85 }, { label: 'Under', odds: 1.85 }] }
];

function fillPlaceholders(text = '', match = {}, players = {}) {
  const teamA = match.teamA || 'Team A';
  const teamB = match.teamB || 'Team B';
  const player1 = players.player1 || 'Player A';
  const player2 = players.player2 || 'Player B';
  const bowler1 = players.bowler1 || 'Bowler A';
  const bowler2 = players.bowler2 || 'Bowler B';
  const starBatsman = players.starBatsman || 'Star Batsman';
  const starBowler = players.starBowler || 'Star Bowler';

  return text
    .replace(/\{teamA\}/g, teamA)
    .replace(/\{teamB\}/g, teamB)
    .replace(/\{player1\}/g, player1)
    .replace(/\{player2\}/g, player2)
    .replace(/\{bowler1\}/g, bowler1)
    .replace(/\{bowler2\}/g, bowler2)
    .replace(/\{starBatsman\}/g, starBatsman)
    .replace(/\{starBowler\}/g, starBowler);
}

const defaultQuestionTemplates = [
  {
    categoryName: 'Match Winner',
    question: 'Who will win the match?',
    options: [

    ]
  },
  {
    categoryName: 'Overs',
    question: 'Runs in next over?',
    options: [
      { label: 'Under 6', odds: 1.8 },
      { label: '6 or more', odds: 2.1 }
    ]
  },
  {
    categoryName: 'Run',
    question: 'Next ball result?',
    options: [
      { label: 'Dot Ball', odds: 1.9 },
      { label: 'Run Scored', odds: 1.9 }
    ]
  },
  {
    categoryName: 'Player',
    question: 'Will striker score a boundary this over?',
    options: [
      { label: 'Yes', odds: 2.2 },
      { label: 'No', odds: 1.7 }
    ]
  },
  {
    categoryName: 'Wicket',
    question: 'Wicket in this over?',
    options: [
      { label: 'Yes', odds: 3.1 },
      { label: 'No', odds: 1.4 }
    ]
  },

];

async function ensureDefaultQuestions(matchId) {
  const match = await Match.findById(matchId, 'teamA teamB');
  if (!match) return;

  const existingQuestions = await Question.find({ matchId });
  const existingQuestionTexts = new Set(
    existingQuestions.map((q) => (q.question || '').toLowerCase().trim())
  );

  const missingTemplates = defaultQuestionTemplates.filter(
    (template) => !existingQuestionTexts.has(template.question.toLowerCase())
  );

  if (!missingTemplates.length) return;

  const categories = await Category.find({
    name: { $in: missingTemplates.map((item) => item.categoryName) }
  });
  const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category]));

  for (const template of missingTemplates) {
    const key = template.categoryName.toLowerCase();
    let category = categoryMap.get(key);
    if (!category) {
      category = await Category.create({ name: template.categoryName });
      categoryMap.set(key, category);
    }

    await Question.create({
      matchId,
      categoryId: category._id,
      categoryName: category.name,
      question: template.question,
      options: template.question === 'Who will win the match?'
        ? [{ label: match.teamA }, { label: match.teamB }]
        : template.options,
      status: 'open',
      isSystemQuestion: template.question === 'Who will win the match?'
    });
  }
}

export async function listQuestions(req, res) {
  const { matchId } = req.params;
  await ensureDefaultQuestions(matchId);
  const questions = await Question.find({ matchId });
  res.json(questions);
}

export async function createQuestion(req, res) {
  const q = await Question.create(req.body);
  res.json(q);
}

export async function createTemplateQuestions(req, res) {
  const { matchId } = req.params;
  const players = req.body.players || {};
  const match = await Match.findById(matchId, 'teamA teamB matchTime');
  if (!match) return res.status(404).json({ message: 'Match not found' });

  // create categories map
  const names = Array.from(new Set(setAndForgetTemplates.map((t) => t.categoryName)));
  const categories = await Category.find({ name: { $in: names } });
  const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  const created = [];
  for (const tpl of setAndForgetTemplates) {
    const key = tpl.categoryName.toLowerCase();
    let category = categoryMap.get(key);
    if (!category) {
      category = await Category.create({ name: tpl.categoryName });
      categoryMap.set(key, category);
    }

    // build options (fill placeholders in option labels too)
    let options = tpl.options ? tpl.options.map((o) => ({ label: fillPlaceholders(o.label, match, players), odds: o.odds })) : null;
    if (!options) {
      if (tpl.type === 'team') {
        options = [
          { label: match.teamA, odds: tpl.odds ?? 1.85 },
          { label: match.teamB, odds: tpl.odds ?? 1.85 }
        ];
      } else if (tpl.placeholders && tpl.placeholders.length >= 2) {
        const a = players[tpl.placeholders[0]] || `Player A`;
        const b = players[tpl.placeholders[1]] || `Player B`;
        options = [{ label: a, odds: tpl.odds ?? 1.85 }, { label: b, odds: tpl.odds ?? 1.85 }];
      } else {
        options = [];
      }
    }

    const questionText = fillPlaceholders(tpl.question, match, players);

    const q = await Question.create({
      matchId,
      categoryId: category._id,
      categoryName: category.name,
      question: questionText,
      options,
      status: 'open',
      autoLockBeforeMinutes: 5
    });
    created.push(q);
  }

  // emit created questions so connected clients update in real-time
  try {
    const io = getIO();
    if (io) {
      for (const q of created) {
        io.emit('question:update', q);
      }
    }
  } catch (err) {
    console.error('Emit question:update failed', err);
  }

  res.json({ createdCount: created.length, created });
}

export async function addCategory(req, res) {
  // placeholder; categories are added via adminRoutes
  res.json({ ok: true });
}
