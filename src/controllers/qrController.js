import QRCode from "qrcode"

/* ======================
   GENERATE UPI QR (USER DEPOSIT)
====================== */
export const generateUserDepositUpiQR = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log(req.userId)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const upiId = process.env.UPI_ID;
    const payeeName = process.env.UPI_NAME;

    if (!upiId || !payeeName) {
      return res.status(500).json({ message: "UPI not configured" });
    }

    // 🔥 UNIQUE TRANSACTION ID (for UTR mapping)
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "QR generation failed" });
  }
};
