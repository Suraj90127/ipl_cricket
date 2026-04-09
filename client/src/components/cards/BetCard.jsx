import { format } from '../../utils/format.js';
import { Trophy, Clock, XCircle } from 'lucide-react';

export default function BetCard({ bet }) {
  const isPending = !bet.result || bet.result === 'pending';
  const isWin = bet.result === 'win';

  return (
    <div className="group relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 shadow-lg transition-all hover:bg-white/10">

      {/* Status indicator line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isWin ? "bg-emerald-500" : isPending ? "bg-amber-400" : "bg-red-500"
        }`}
      ></div>

      <div className="flex justify-between items-start pl-2">
        <div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {format.dateTime(bet.createdAt)}
          </span>

          <h4 className="font-bold text-white text-sm mt-0.5 max-w-[200px] truncate">
            {bet.matchName}
          </h4>

          {/* Playing Team + Score */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-white/50 uppercase">
              {bet.playingTeam}
            </span>

            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
              {bet.score}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="font-extrabold text-lg text-white leading-none">
            ₹{isWin ? bet.profit.toFixed(2) : bet.amount.toFixed(2)}
          </p>

          <div
            className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
              isWin
                ? "bg-emerald-500/20 text-emerald-400"
                : isPending
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isWin ? <Trophy size={10} /> : isPending ? <Clock size={10} /> : <XCircle size={10} />}
            {bet.result ?? "pending"}
          </div>
        </div>
      </div>

      <div className="pl-2 mt-1">
        <div className="text-sm font-medium text-white/80 bg-white/5 p-3 rounded-xl border border-white/10 relative">
          
          <span className="block text-[10px] uppercase font-bold text-white/40 mb-1">
            Prediction
          </span>

          {bet.question}

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">

            {/* Your Pick */}
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                Your Pick
              </span>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 border mt-1 ${
                  isWin
                    ? "border-emerald-400/30 text-emerald-400"
                    : "border-teal-400/30 text-teal-400"
                }`}
              >
                {bet.selectedOption}
              </span>
            </div>

            {/* Odds */}
            <div className="text-right">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                Odds
              </span>

              <div className="text-[12px] font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 mt-1">
                {bet.odds}x
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}