import { Router } from 'express';
import {
  adminAddCategory, adminAddMatch, adminAddQuestion, adminResult, adminUpdateScore,
  adminGetStats,
  adminGetUsers, adminGetUserDetails, adminBlockUser, adminUnblockUser, adminAdjustWallet,
  adminGetBets, adminGetLiveBets, adminGetLiveQuestions,
  adminGetMatches, adminUpdateMatch, adminDeleteMatch,
  adminGetQuestions, adminUpdateQuestion, adminBulkUpdateQuestions,
  adminGetTransactions, adminUpdateTransaction, adminDeleteQuestion,
  deleteBet,
  createRedeemCode,
  getAllRedeemCodes,
  getRedeemCodeById
} from '../controllers/adminController.js';
import { uploadImageHandler } from '../controllers/uploadController.js';
import { adminUpdateSettings } from '../controllers/settingsController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import paymentMethodRoutes from './paymentMethodRoutes.js';
import {
  getUpiDetails,
  updateUpiDetails,
} from "../controllers/adminUpiController.js"

const router = Router();
router.use(requireAuth, requireAdmin);

// existing
router.post('/match', adminAddMatch);
router.post('/category', adminAddCategory);
router.post('/question', adminAddQuestion);
router.post('/result', adminResult);
router.post('/score', adminUpdateScore);

// stats
router.get('/stats', adminGetStats);

// users
router.get('/users', adminGetUsers);
router.get('/users/:id/details', adminGetUserDetails);
router.patch('/users/:id/block', adminBlockUser);
router.patch('/users/:id/unblock', adminUnblockUser);
router.patch('/users/:id/wallet', adminAdjustWallet);

// bets
router.get('/bets', adminGetBets);
router.get('/live-bets', adminGetLiveBets);
router.delete("/bet/:id", deleteBet);
router.get('/live-questions', adminGetLiveQuestions);

// matches
router.get('/matches', adminGetMatches);
router.patch('/matches/:id', adminUpdateMatch);
router.delete('/matches/:id', adminDeleteMatch);

// questions
router.get('/questions', adminGetQuestions);
router.patch('/questions/:id', adminUpdateQuestion);
router.delete('/questions/:id', adminDeleteQuestion);
router.post('/questions/bulk-update', adminBulkUpdateQuestions);

// transactions
router.get('/transactions', adminGetTransactions);
router.patch('/transactions/:id', adminUpdateTransaction);

// image upload
router.post('/upload', uploadImageHandler);

// admin settings (persisted)
router.patch('/settings', adminUpdateSettings);

// payment methods
router.use('/payment-methods', paymentMethodRoutes);

// Public route (user fetch kare)
router.get("/upi", getUpiDetails);

// Admin route
router.put("/update/upi", updateUpiDetails);

router.post("/create-code", createRedeemCode);

router.get("/redeem-codes", getAllRedeemCodes);

// ✅ Get single code
router.get("/redeem-codes/:id", getRedeemCodeById);



export default router;
