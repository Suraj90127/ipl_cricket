import QRCode from "qrcode";
import UpiSettings from "../models/upiSettingsModel.js";

/* ======================
   GENERATE UPI QR (USER DEPOSIT)
====================== */
export const generateUserDepositUpiQR = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log(req.userId);

    if (!amount) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    if (amount < 300) {
      return res.status(400).json({ message: "minimum 300 required" });

    }

    // 🔥 DB se UPI fetch
    const upiData = await UpiSettings.findOne();

    if (!upiData) {
      return res.status(500).json({ message: "UPI not configured" });
    }

    const upiId = upiData.upiId;
    const payeeName = upiData.upiName;

    // 🔥 UNIQUE TRANSACTION ID
    const txnId = `DEP_${req.userId}_${Date.now()}`;

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
      `User Deposit | ${txnId}`
    )}`;

    const qrImage = await QRCode.toDataURL(upiLink, {
      errorCorrectionLevel: "H",
      margin: 2,
      scale: 8,
    });

    res.json({
      success: true,
      amount,
      transactionId: txnId,
      upiLink,
      qrImage,
      upiId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "QR generation failed" });
  }
};