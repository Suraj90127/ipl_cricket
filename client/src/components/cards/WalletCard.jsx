import { Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function WalletCard({ balance = 0, activeMode, onSelectMode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2a3a] via-[#0b1220] to-[#05070f] p-6 text-white shadow-2xl border border-white/10">

      {/* glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full"></div>

      {/* header */}
      <div className="flex items-center gap-2 text-teal-400 mb-4">
        <Wallet size={18} />
        <span className="text-sm font-semibold tracking-wide">
          Total Balance
        </span>
      </div>

      {/* balance */}
      <div className="flex items-end gap-1 mb-6">
        <span className="text-xl text-teal-400 font-bold">₹</span>
        <span className="text-4xl font-black tracking-tight">
          {Number(balance).toFixed(2)}
        </span>
      </div>

      {/* buttons */}
      <div className="flex gap-3">

        <button
          onClick={() => onSelectMode("recharge")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300
          ${
            activeMode === "recharge"
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-lg shadow-teal-500/20"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          <ArrowDownToLine size={16} />
          Recharge
        </button>

        <button
          onClick={() => onSelectMode("withdraw")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300
          ${
            activeMode === "withdraw"
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-lg shadow-teal-500/20"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          <ArrowUpFromLine size={16} />
          Withdraw
        </button>

      </div>
    </div>
  );
}