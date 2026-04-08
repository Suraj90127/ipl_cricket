import { format } from '../../utils/format.js';
import { Trophy, Clock, XCircle } from 'lucide-react';

export default function BetCard({ bet }) {
  const isPending = !bet.result || bet.result === 'pending';
  const isWin = bet.result === 'win';

  return (
    <div className="group premium-card p-4 relative overflow-hidden bg-white border border-slate-100 flex flex-col gap-3">

      {/* Status indicator line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isWin ? "bg-emerald-500" : isPending ? "bg-amber-400" : "bg-red-500"
        }`}
      ></div>

      <div className="flex justify-between items-start pl-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {format.dateTime(bet.createdAt)}
          </span>

          <h4 className="font-bold text-slate-800 text-sm mt-0.5 max-w-[200px] truncate">
            {bet.matchName}
          </h4>

          {/* Playing Team + Score */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">
              {bet.playingTeam}
            </span>

            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {bet.score}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="font-extrabold text-lg text-slate-800 leading-none">
            ₹{isWin ? bet.profit.toFixed(2) : bet.amount.toFixed(2)}
          </p>

          <div
            className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
              isWin
                ? "bg-emerald-50 text-emerald-600"
                : isPending
                ? "bg-amber-50 text-amber-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isWin ? <Trophy size={10} /> : isPending ? <Clock size={10} /> : <XCircle size={10} />}
            {bet.result ?? "pending"}
          </div>
        </div>
      </div>

      <div className="pl-2 mt-1">
        <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
          
          <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Prediction
          </span>

          {bet.question}

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">

            {/* Your Pick */}
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Your Pick
              </span>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded bg-white border mt-1 ${
                  isWin
                    ? "border-emerald-200 text-emerald-600"
                    : "border-slate-200 text-accent"
                }`}
              >
                {bet.selectedOption}
              </span>
            </div>

            {/* Odds */}
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Odds
              </span>

              <div className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-1">
                {bet.odds}x
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}