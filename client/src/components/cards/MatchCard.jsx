import { Link } from "react-router-dom";
import { format } from "../../utils/format.js";
import { Clock, Calendar } from "lucide-react";

export default function MatchCard({ match }) {
  const isLive = match.status?.toLowerCase() === "live";

  return (
    <Link
      to={`/matches/${match._id}`}
      className="block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Cricket
          </span>

          <span
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded ${
              isLive
                ? "bg-red-100 text-red-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isLive && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
            {match.status}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {format.time(match.matchTime)}
          </span>

          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format.date(match.matchTime)}
          </span>
        </div>

      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">

        {/* Team A */}
        <div className="flex flex-col items-center w-1/3">
          <div className="w-14 h-14 rounded-full border border-blue-600 p-1 bg-blue-200 flex items-center justify-center overflow-hidden">
            {match.teamALogo ? (
              <img
                src={match.teamALogo}
                alt={match.teamA}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e2e8f0"/%3E%3Ctext x="50" y="50" font-size="40" font-weight="bold" text-anchor="middle" dy=".3em" fill="%2364748b"%3E?%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <span className="text-slate-400 font-bold text-lg">?</span>
            )}
          </div>

          <span className="text-sm font-semibold text-slate-700 text-center mt-1">
            {match.teamA}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center w-1/3">
          {(match.teamAScore || match.teamBScore) ? (
            <div className="flex flex-col items-center">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white mb-1">
                {match.teamAScore || '-'}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
                {match.teamBScore || '-'}
              </span>
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-500">VS</div>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center w-1/3">
          <div className="w-14 h-14 rounded-full border border-red-400 p-1 bg-red-200 flex items-center justify-center overflow-hidden">
            {match.teamBLogo ? (
              <img
                src={match.teamBLogo}
                alt={match.teamB}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e2e8f0"/%3E%3Ctext x="50" y="50" font-size="40" font-weight="bold" text-anchor="middle" dy=".3em" fill="%2364748b"%3E?%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <span className="text-slate-400 font-bold text-lg">?</span>
            )}
          </div>

          <span className="text-sm font-semibold text-slate-700 text-center mt-1">
            {match.teamB}
          </span>
        </div>

      </div>
    </Link>
  );
}