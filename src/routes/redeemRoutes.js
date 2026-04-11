import express from "express";
import requireAuth from "../middleware/auth.js";
import { redeemCode } from "../controllers/userRedeemController.js";

const router = express.Router();

// ✅ USER REDEEM
router.post("/redeem", requireAuth, redeemCode);

export default router;