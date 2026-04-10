import { Link } from "react-router-dom";
import { format } from "../../utils/format.js";
import { Clock } from "lucide-react";

export default function MatchCard({ match }) {
  const isLive = match.status?.toLowerCase() === "live";
  const isUpcoming = match.status?.toLowerCase() === "upcoming";
  // console.log("match", match);


  const getShortName = (name) => {
    if (!name) return "";

    // Split words (e.g. "Kolkata Knight Riders")
    const words = name.trim().split(" ");

    // Agar 2+ words hai → initials use kar
    if (words.length > 1) {
      return words.map(w => w[0]).join("").toUpperCase();
    }

    // Single word → first 3 letters
    return name.slice(0, 3).toUpperCase();
  };

  return (
    <Link
      to={`/matches/${match._id}`}
      className="block rounded-3xl overflow-hidden group"
    >
      <div
        className="relative p-4 
        bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f]
        border border-white/5 backdrop-blur-xl 
        shadow-lg transition-all duration-300
        group-hover:shadow-[0_0_40px_rgba(45,212,191,0.25)]"
      >

        {/* Animated Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-transparent to-cyan-400/10 opacity-70 group-hover:opacity-100 transition"></div>

        {/* Top Time */}
        <div className="relative z-10 text-center text-xs text-white/50 mb-3 tracking-wide">
          {format.date(match.matchTime)} • {format.time(match.matchTime)}
        </div>

        {/* Teams Row */}
        <div className="relative flex items-center justify-between">

          {/* Team A */}
          <div className="flex flex-col items-center gap-3 w-1/3">
            <div className="w-12 h-12 rounded-full 
            bg-white/5 border border-white/10 backdrop-blur 
            flex items-center justify-center overflow-hidden
            group-hover:scale-105 transition">

              {match.teamALogo ? (
                <img src={match.teamALogo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold">
                  {match.teamA?.slice(0, 3)}

                </span>
              )}
            </div>

            <span className="text-white font-semibold text-sm tracking-widest">
              {getShortName(match.teamA)}
            </span>
          </div>

          {/* Center Score */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-white/40 text-[11px] mb-1">VS</span>

            {(match.teamAScore || match.teamBScore) ? (
              <span className="text-sm font-bold text-white tracking-wide">
                {match.teamAScore || 0} - {match.teamBScore || 0}
              </span>
            ) : (
              <span
                className={`text-sm font-semibold tracking-wide ${isLive
                  ? "text-teal-400 animate-pulse"
                  : "text-white/60"
                  }`}
              >
                {isLive ? "LIVE" : format.time(match.matchTime)}
              </span>
            )}

            {/* Live Pulse Dot */}
            {isLive && (
              <span className="mt-1 w-2 h-2 bg-teal-400 rounded-full animate-ping"></span>
            )}

          </div>

          {/* Team B */}
          <div className="flex flex-col-reverse items-center gap-3 justify-end w-1/3">
            <span className="text-white font-semibold text-sm truncate text-right">
              {match.teamB}
            </span>

            <div className="w-12 h-12 rounded-full 
            bg-white/5 border border-white/10 backdrop-blur 
            flex items-center justify-center overflow-hidden
            group-hover:scale-105 transition">

              {match.teamBLogo ? (
                <img src={match.teamBLogo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-sm tracking-widest">
                  {getShortName(match.teamB)}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Divider Glow Line */}
        <div className="relative z-10 mt-4 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"></div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center justify-between mt-3 text-xs text-white/50">

          <span className="flex items-center gap-1 hover:text-white transition">
            👁 {Math.floor(Math.random() * 10)}K
          </span>

          <span className="flex items-center gap-1 hover:text-white transition">
            👍 {Math.floor(Math.random() * 100)}
          </span>

          <span className="flex items-center gap-1 hover:text-white transition">
            🔥 {Math.floor(Math.random() * 50)}
          </span>

        </div>

      </div>
    </Link>
  );
}