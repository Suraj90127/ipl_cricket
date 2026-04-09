const express = require("express");
const router = express.Router();
const {
  getUpiDetails,
  updateUpiDetails,
} = require("../controllers/adminUpiController");
const protect = require("../middlewares/authMiddleware");

// Public route (user fetch kare)
router.get("/upi",protect, getUpiDetails);

// Admin route
router.put("/admin/upi", protect, updateUpiDetails);

module.exports = router;