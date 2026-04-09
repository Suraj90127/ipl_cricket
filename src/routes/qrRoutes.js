import { Router } from "express";
import { generateUserDepositUpiQR } from "../controllers/qrController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.post("/upi-pay",requireAuth, generateUserDepositUpiQR);

export default router; 