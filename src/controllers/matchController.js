import Match from '../models/Match.js';

export async function listMatches(req, res) {
  const { status } = req.query;
  const query = status ? { status } : {};
  const matches = await Match.find(query).sort({ matchTime: 1 });
  res.json(matches);
}

export async function getMatch(req, res) {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ message: 'Not found' });
  res.json(match);
}

export async function createMatch(req, res) {
  const match = await Match.create(req.body);
  res.json(match);
}

export async function liveScores(_req, res) {
  const matches = await Match.find({ status: 'live' });
  res.json(matches);
}
