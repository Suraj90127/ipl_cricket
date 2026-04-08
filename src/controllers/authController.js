import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

// DAILY BONUS
export async function claimDailyBonus(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0];
    const lastClaim = user.lastDailyClaim
      ? new Date(user.lastDailyClaim).toISOString().split("T")[0]
      : null;

    if (today === lastClaim) {
      return res.status(400).json({ message: "Already claimed today" });
    }

    user.balance += 5;
    user.dailyBonus = 5;
    user.lastDailyClaim = new Date();

  

    await Transaction.create({
      userId: user._id,
      amount: 5,
      type: "bonus",
      status: "success",
      note: "Daily Claim Bonus",
    });
    await user.save();
    res.json({
      message: "Daily bonus claimed",
      balance: user.balance,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server errors" });
  }
}

// SIGNUP
export async function signup(req, res) {
  try {
    const { name, phone, password, referralCode } = req.body;

    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, phone and password are required" });
    }

    const normalizedPhone = String(phone).trim();

    const exists = await User.findOne({ phone: normalizedPhone });
    if (exists)
      return res.status(400).json({ message: "Phone already registered" });

    const myReferralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    let referrer = null;
    let signupBonus = 0;

    // Validate referral code if provided
    if (referralCode) {
      referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });

      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }

      signupBonus = 5;
    }

    // Generate next UID (starting from 10000)
    const lastUser = await User.findOne().sort({ uid: -1 }).limit(1);
    const nextUid = lastUser && lastUser.uid ? lastUser.uid + 1 : 10000;

    const user = await User.create({
      uid: nextUid,
      name: name.trim(),
      phone: normalizedPhone,
      password,
      referralCode: myReferralCode,
      referredBy: referrer?._id || null,
      balance: signupBonus,
    });

    if (signupBonus > 0) {
      await Transaction.create({
        userId: user._id,
        amount: signupBonus,
        type: "bonus",
        status: "success",
        note: "Signup Bonus",
      });
    }

    if (referrer) {
      referrer.balance += 100;
      await referrer.save();

      await Transaction.create({
        userId: referrer._id,
        amount: 100,
        type: "bonus",
        status: "success",
        note: "Referral Bonus",
      });
    }

    const token = makeToken(user);

    res.json({
      token,
      user: sanitize(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone: String(phone).trim() });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);

    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = makeToken(user);

    res.json({
      token,
      user: sanitize(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// CURRENT USER
export async function me(req, res) {
  const user = await User.findById(req.userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(sanitize(user));
}

// UPDATE PROFILE
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone, password } = req.body;

    if (name) user.name = name.trim();

    if (email) {
      const exists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (exists)
        return res.status(400).json({ message: "Email already in use" });

      user.email = email.toLowerCase().trim();
    }

    if (phone) {
      const exists = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });

      if (exists)
        return res.status(400).json({ message: "Phone already in use" });

      user.phone = phone.trim();
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      user.password = password;
    }

    await user.save();

    res.json(sanitize(user));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// LOGOUT
export function logout(req, res) {
  res.json({ ok: true });
}