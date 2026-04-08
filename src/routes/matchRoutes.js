import { Router } from 'express';
import { listMatches, getMatch, liveScores } from '../controllers/matchController.js';

const router = Router();
router.get('/matches', listMatches);
router.get('/match/:id', getMatch);
router.get('/live-scores', liveScores);

export default router;
