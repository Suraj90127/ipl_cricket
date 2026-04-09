import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpiStore } from "../../store/useUpiStore";
import { useUtrStore } from "../../store/useUtrStore";

export default function PaymentPage() {
  const { submitUTR, utrLoading, utrMessage } = useUtrStore();
  const [utr, setUtr] = useState("");
  const [timeLeft, setTimeLeft] = useState(480);
  
  const navigate = useNavigate();
  const { generateQR, qrData, loading } = useUpiStore();
  const [upiId, setUpiId] = useState("7983247157@ptyes");


  // console.log("Select Payment Method0", qrData);


  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get("amount")) || 0;


const paymentMethod = (type) => {
  if (type === "phonepe") {
    const payload = {
        contact: {
          cbnName: "",
          nickName: "",
          type: "VPA",
          vpa: upiId,
        },
        p2pPaymentCheckoutParams: {
          checkoutType: "DEFAULT",
          initialAmount: amount * 100,
          note: "Payment",
          isByDefaultKnownContact: true,
          currency: "INR",
          transactionContext: "collect", // try this
          showKeyboard: true,
        },
    };

    const encoded = btoa(JSON.stringify(payload));

    window.location.href = `phonepe://native?data=${encoded}&id=p2ppayment`;
  }

  if (type === "paytm") {
    // Direct UPI (better)
    window.location.href = `paytmmp://cash_wallet?pa=${qrData?.upiId}&pn=null&cu=INR&tn=&am=${amount}.00&featuretype=money_transfer`;
  }
};
  // ⏱ TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⛔ Payment time expired");
          navigate("/wallet");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔥 AUTO GENERATE QR
  useEffect(() => {
    if (amount > 0) {
      generateQR(amount);
    }
  }, [amount]);

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

  const handleSubmit = async () => {
    if (!utr) return alert("Please enter UTR ID");

    const res = await submitUTR(utr);

    if (res) {
      alert(res.message || "UTR submitted successfully");
      navigate("/wallet");
    }
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
      </div>

      {/* Payment Method */}
      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-white/80 mb-3">
          Select Payment Method
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => paymentMethod("paytm")} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <img src="https://i.ibb.co/v64348jF/paytmimg.jpg" className="w-6 h-6" />
            <span className="text-sm font-semibold">Paytm</span>
          </button>

          <button onClick={() => paymentMethod("phonepe")} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <img src="https://i.ibb.co/pBK859jF/phonepe-icon.webp" className="w-6 h-6" />
            <span className="text-sm font-semibold">PhonePe</span>
          </button>
        </div>
      </div>

      {/* 🔥 QR SECTION */}
      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">

        <h3 className="text-sm font-semibold text-white/80 mb-4">
          Scan & Pay
        </h3>

        {loading ? (
          <p className="text-white/60">Generating QR...</p>
        ) : qrData?.qrImage ? (
          <div className="bg-white p-3 rounded-2xl inline-block shadow-xl">
            <img
              src={qrData.qrImage}
              alt="QR Code"
              className="w-[70vw] max-w-[260px] min-w-[180px]"
            />
          </div>
        ) : (
          <p className="text-red-400">QR not generated</p>
        )}

        <p className="text-xs text-white/50 mt-3">
          Scan using any UPI app
        </p>

      </div>

      {/* Warning */}
      <div className="mt-4 p-3 rounded-xl 
      bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 text-sm">
        ⚠ Payment can only be made once. Multiple payments are not valid.
      </div>

      {/* Transfer */}
      <div className="mt-6 p-4 rounded-2xl 
      bg-white/5 border border-white/10 backdrop-blur-xl">

        <h3 className="text-sm font-semibold mb-4 text-white/80">
          Transfer Details
        </h3>

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
              disabled={utrLoading}
              className="px-4 py-2 rounded-xl 
  bg-gradient-to-r from-teal-500 to-cyan-500 
  text-black font-semibold disabled:opacity-50"
            >
              {utrLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-white/40 text-xs">
        Secured by UPI • 100% Safe Payments
      </div>

    </div>
  );
}