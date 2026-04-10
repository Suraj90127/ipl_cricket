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
  try {
    const { matchTime, ...rest } = req.body;

    const match = await Match.create({
      ...rest,
      matchTime: new Date(matchTime) // ✅ ensure proper UTC conversion
    });

    res.json({
      ...match._doc,
      matchTime: new Date(match.matchTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      })
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function liveScores(_req, res) {
  const matches = await Match.find({ status: 'live' });
  res.json(matches);
}
