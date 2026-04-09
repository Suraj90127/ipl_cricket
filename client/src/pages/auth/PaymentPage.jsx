import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpiStore } from "../../store/useUpiStore";

export default function PaymentPage() {
    const [utr, setUtr] = useState("");
    const [upiId, setUpiId] = useState("8630032980@upi");
    const [showQR, setShowQR] = useState(false);
    const [timeLeft, setTimeLeft] = useState(480);

    const navigate = useNavigate();
    const { generateQR, qrData, loading, reset } = useUpiStore();

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const amount = Number(params.get("amount")) || 0;

    // ⏱ TIMER
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert(" Payment time expired");
                    navigate("/wallet");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s.toString().padStart(2, "0")}`;
    };

    if (!amount || amount <= 0) {
        return <div className="text-white p-4">Invalid Amount</div>;
    }

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleSubmit = () => {
        if (!utr) return alert("Please enter UTR ID");
        alert("Payment submitted: " + utr);
    };

    return (
        <div className="min-h-screen px-4 pb-10 
    bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f] text-white">

            {/* Amount */}
            <div className="mt-4 rounded-3xl p-6 text-center 
                        bg-gradient-to-r from-teal-500/20 to-cyan-500/20 
                        border border-white/10 backdrop-blur-xl shadow-lg">

                <p className="text-sm text-white/60">Payment Amount</p>

                <h1 className="text-4xl font-bold mt-2 tracking-wide">
                    ₹{amount}
                </h1>

                <p className="text-sm text-teal-400 mt-2 font-semibold">
                    {formatTime(timeLeft)}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b border-white/10 pb-2">
                <button className="text-teal-400 font-semibold border-b-2 border-teal-400 pb-1">
                    Direct Transfer
                </button>

                <button
                    onClick={() => {
                        setShowQR(true);
                        generateQR(amount);
                    }}
                    className="text-white/40 hover:text-teal-400 transition"
                >
                    Scan QRCode
                </button>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white/80 mb-3">
                    Select Payment Method
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <img src="/paytm.png" className="w-6 h-6" />
                        <span className="text-sm font-semibold">Paytm</span>
                    </button>

                    <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <img src="/phonepe.png" className="w-6 h-6" />
                        <span className="text-sm font-semibold">PhonePe</span>
                    </button>
                </div>
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 text-sm">
                ⚠ Payment can only be made once. Multiple payments are not valid.
            </div>

            {/* Transfer */}
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">

                <h3 className="text-sm font-semibold mb-4 text-white/80">
                    Transfer Details
                </h3>

                {/* UPI INPUT */}
                <div className="mb-4">
                    <p className="text-xs text-white/50 mb-1">UPI ID</p>

                    <div className="flex gap-2">
                        <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                        />

                        <button
                            onClick={() => handleCopy(upiId)}
                            className="px-3 rounded-xl bg-white/5 border border-white/10"
                        >
                            <Copy size={16} className="text-teal-400" />
                        </button>
                    </div>
                </div>

                {/* PAY BUTTON (BACKEND LINK) */}
                <button
                    onClick={async () => {
                        if (!qrData?.upiLink) {
                            await generateQR(amount);
                        }

                        // thoda delay taaki state update ho jaye
                        setTimeout(() => {
                            if (qrData?.upiLink) {
                                window.location.href = qrData.upiLink;
                            }
                        }, 300);
                    }}
                    className="w-full text-center mb-4 py-2 rounded-xl 
  bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold"
                >
                    Pay via UPI App
                </button>

                {/* Amount */}
                <div className="mb-4">
                    <p className="text-xs text-white/50 mb-1">Amount</p>

                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-sm font-semibold">₹{amount}</span>
                        <button onClick={() => handleCopy(amount)}>
                            <Copy size={16} className="text-teal-400" />
                        </button>
                    </div>
                </div>

                {/* UTR */}
                <div className="mt-4">
                    <p className="text-xs text-white/50 mb-1">
                        Enter UTR / Reference ID
                    </p>

                    <div className="flex gap-2">
                        <input
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="Enter UTR ID"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                        />

                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold"
                        >
                            Submit
                        </button>
                    </div>
                </div>

            </div>

            {/* QR MODAL */}
            {showQR && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#0b1220] border border-white/10 rounded-2xl p-6 text-center">

                        <h2 className="text-lg font-semibold mb-4">Scan & Pay</h2>

                        {loading ? (
                            <p className="text-white/60">Generating QR...</p>
                        ) : qrData?.qrImage ? (
                            <img
                                src={qrData.qrImage}
                                alt="QR Code"
                                className="mx-auto mb-4 rounded-xl 
                                        w-[70vw] max-w-[260px] min-w-[180px] 
                                        h-auto object-contain shadow-lg"
                            />
                        ) : (
                            <p className="text-red-400">QR not generated</p>
                        )}

                        <button
                            onClick={() => {
                                setShowQR(false);
                                reset();
                            }}
                            className="px-4 py-2 bg-teal-500 text-black rounded-xl font-semibold mt-4"
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-white/40 text-xs">
                Secured by UPI • 100% Safe Payments
            </div>

        </div>
    );
}