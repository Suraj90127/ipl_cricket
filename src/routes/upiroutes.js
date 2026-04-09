import express from "express";
import {
  getUpiDetails,
  updateUpiDetails,
} from "../controllers/adminUpiController";

const router = express.Router();

import { requireAuth } from '../middleware/auth.js';

// Public route (user fetch kare)
router.get("/upi", requireAuth, getUpiDetails);

// Admin route
router.put("/admin/upi", requireAuth, updateUpiDetails);

export default router;