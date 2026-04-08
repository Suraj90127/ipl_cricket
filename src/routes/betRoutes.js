import { Router } from 'express';
import { betController } from '../controllers/betController.js';
import { requireAuth } from '../middleware/auth.js';

export default function betRoutes(io) {
  const router = Router();
  const controller = betController(io);
  router.post('/bet', requireAuth, controller.placeBet);
  router.get('/bets', requireAuth, controller.listBets);
  router.get('/bets/stats', requireAuth, controller.stats);
  return router;
}
