import { Router } from 'express';
import { login, logout, signup, me, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

import { claimDailyBonus } from '../controllers/authController.js';

router.post('/claim-daily', requireAuth, claimDailyBonus);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);

export default router;
