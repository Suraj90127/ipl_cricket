import { Router } from 'express';
import { recharge, withdraw, transactions, updateRechargeUTR } from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/recharge', requireAuth, recharge);
router.post("/update-utr",requireAuth, updateRechargeUTR);
router.post('/withdraw', requireAuth, withdraw);
router.get('/transactions', requireAuth, transactions);

export default router;
