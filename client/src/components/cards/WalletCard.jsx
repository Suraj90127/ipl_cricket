import { Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function WalletCard({ balance = 0, activeMode, onSelectMode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white shadow-xl">

      {/* glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>

      {/* header */}
      <div className="flex items-center gap-2 text-indigo-200 mb-4">
        <Wallet size={18} />
        <span className="text-sm font-semibold tracking-wide">
          Total Balance
        </span>
      </div>

      {/* balance */}
      <div className="flex items-end gap-1 mb-6">
        <span className="text-xl text-indigo-200">₹</span>
        <span className="text-4xl font-black tracking-tight">
          {Number(balance).toFixed(2)}
        </span>
      </div>

      {/* buttons */}
      <div className="flex gap-3">

        <button
          onClick={() => onSelectMode("recharge")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition
          ${
            activeMode === "recharge"
              ? "bg-white text-indigo-700 shadow-lg"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <ArrowDownToLine size={16} />
          Recharge
        </button>

        <button
          onClick={() => onSelectMode("withdraw")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition
          ${
            activeMode === "withdraw"
              ? "bg-white text-indigo-700 shadow-lg"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <ArrowUpFromLine size={16} />
          Withdraw
        </button>

      </div>
    </div>
  );
}