import { Router } from "express";
import { generateUserDepositUpiQR } from "../controllers/qrController.js";

const router = Router();

router.post("/upi-pay", generateUserDepositUpiQR);

export default router;