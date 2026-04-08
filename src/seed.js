import User from './models/User.js';
import Match from './models/Match.js';
import Category from './models/Category.js';
import Question from './models/Question.js';

export async function seedAdmin() {
  const existing = await User.findOne({ email: 'admin@cricketpro.dev' });
  if (existing) return;
  await User.create({
    name: 'Admin',
    phone: '9999999999',
    email: 'admin@cricketpro.dev',
    password: 'Admin@123',
    role: 'admin'
  });
  console.log('Seeded admin user');
}

export async function seedDemo() {
  const matchCount = await Match.countDocuments();
  if (matchCount > 0) return;
  const match = await Match.create({
    teamA: 'India',
    teamB: 'Australia',
    teamALogo: 'https://flagcdn.com/w160/in.png',
    teamBLogo: 'https://flagcdn.com/w160/au.png',
    matchTime: new Date(Date.now() + 3600 * 1000),
    status: 'live',
    teamAScore: '120',
    teamBScore: '115'
  });
  const cat = await Category.create({ name: 'Match Winner' });
  await Question.create({
    matchId: match._id,
    categoryId: cat._id,
    categoryName: cat.name,
    question: 'Who will win the match?',
    options: [{ label: 'India' }, { label: 'Australia' }],
    status: 'open'
  });
  console.log('Seeded demo match/questions');
}
