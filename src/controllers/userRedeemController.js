import RedeemCode from "../models/RedeemCode.js";
import User from "../models/User.js";

export const redeemCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.userId;

        // ❌ Code missing
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Code is required",
            });
        }

        // 🔍 Find code
        const redeem = await RedeemCode.findOne({
            code: code.toUpperCase().trim(),
        });

        // ❌ Invalid code
        if (!redeem || !redeem.isActive) {
            return res.status(404).json({
                success: false,
                message: "Invalid code",
            });
        }

        // ❌ Expired
        if (redeem.expiresAt && redeem.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Code expired",
            });
        }

        // ❌ Limit finished
        if (redeem.peopleLeft <= 0) {
            return res.status(400).json({
                success: false,
                message: "You are not applicable",
            });
        }

        // 🔍 Get user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ❌ First recharge condition
        const isFirstRechargeDone =
            user.firstRecharge === true ||
            String(user.firstRecharge).toLowerCase().trim() === "yes";

        if (!isFirstRechargeDone) {
            return res.status(400).json({
                success: false,
                message: "First recharge required to redeem this code",
            });
        }
        // ❌ Already used by same user
        if (redeem.usedBy.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You already used this code",
            });
        }

        // ✅ CREDIT BALANCE
        user.balance = (user.balance || 0) + redeem.amount;
        await user.save();

        // ✅ UPDATE CODE
        redeem.peopleLeft -= 1;
        redeem.usedBy.push(userId);

        // 🔥 Auto disable
        if (redeem.peopleLeft <= 0) {
            redeem.isActive = false;
        }

        await redeem.save();

        // ✅ SUCCESS RESPONSE
        res.json({
            success: true,
            message: "Code redeemed successfully",
            creditedAmount: redeem.amount,
            newBalance: user.balance,
            peopleLeft: redeem.peopleLeft,
        });

    } catch (err) {
        console.error("Redeem Error:", err);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};