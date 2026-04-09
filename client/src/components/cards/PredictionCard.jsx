import { HelpCircle, TrendingUp, X, Check, IndianRupee } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../providers/SocketProvider.jsx";

export default function PredictionCard({ question, onSelect, disabled, match }) {
  const socket = useSocket();
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [amount, setAmount] = useState("");
  const [timer, setTimer] = useState(question.timerSeconds ?? null);
  const lastSynced = useRef(timer);

  useEffect(() => {
    let intervalId = null;
    let socketHandler = null;

    // If autoCloseAt is set, calculate remaining time and show date
    if (question.autoCloseAt) {
      const closeTime = new Date(question.autoCloseAt).getTime();
      const computeRemaining = () => Math.max(0, Math.ceil((closeTime - Date.now()) / 1000));
      const remaining = computeRemaining();
      if (remaining > 0) {
        setTimer(remaining);
        intervalId = setInterval(() => {
          setTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
      } else {
        setTimer(null);
      }
    }
    // Prefer server-provided timerSeconds if present
    else if (typeof question.timerSeconds === "number" && question.timerSeconds > 0) {
      setTimer(question.timerSeconds);
      lastSynced.current = question.timerSeconds;
      intervalId = setInterval(() => {
        setTimer((t) => {
          const next = t > 0 ? t - 1 : 0;
          // Sync every 5 seconds and on zero
          if (
            question._id &&
            typeof next === "number" &&
            (next === 0 || next % 5 === 0) &&
            next !== lastSynced.current &&
            socket
          ) {
            socket.emit("timer:update", {
              questionId: question._id,
              timerSeconds: next,
            });
            lastSynced.current = next;
          }
          return next;
        });
      }, 1000);

      if (socket && question._id) {
        socketHandler = ({ questionId, timerSeconds }) => {
          if (questionId === question._id && typeof timerSeconds === "number") {
            setTimer(timerSeconds);
            lastSynced.current = timerSeconds;
          }
        };
        socket.on("timer:update", socketHandler);
      }
    } else if (match && question.autoLockBeforeMinutes) {
      // Compute seconds until auto-lock (matchTime - autoLockBeforeMinutes)
      try {
        const mt = new Date(match.matchTime).getTime();
        const lockAt = mt - Number(question.autoLockBeforeMinutes) * 60 * 1000;
        const computeRemaining = () => Math.max(0, Math.ceil((lockAt - Date.now()) / 1000));
        const remaining = computeRemaining();
        if (remaining > 0) {
          setTimer(remaining);
          intervalId = setInterval(() => {
            setTimer((t) => (t > 0 ? t - 1 : 0));
          }, 1000);
        } else {
          setTimer(null);
        }
      } catch (e) {
        setTimer(null);
      }
    } else {
      setTimer(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (socketHandler && socket) socket.off("timer:update", socketHandler);
    };
  }, [question.timerSeconds, question.autoLockBeforeMinutes, question.autoCloseAt, question._id, socket, match?.matchTime]);

  // Determine if betting is allowed for this card
  const matchStatus = (match?.status || "").toLowerCase();
  const questionStatus = (question?.status || "").toLowerCase();
  const isQuestionOpen = questionStatus === 'open';

  // Closed/finished-like states where betting must never be allowed
  const closedStates = new Set(['closed', 'finished', 'ended', 'cancelled']);
  const isMatchClosed = closedStates.has(matchStatus);

  // Some questions are live-only (per-ball/over questions) — disable them until match is live
  const isLiveOnlyQuestion = (q) => {
    if (!q || !q.question) return false;
    const raw = String(q.question).toLowerCase().replace(/[^\w\s]/g, '').trim();
    const liveOnly = [
      'runs in next over',
      'next ball result',
      'will striker score a boundary this over',
      'wicket in this over'
    ];
    return liveOnly.some((t) => raw.includes(t));
  };

  const liveOnly = isLiveOnlyQuestion(question);

  const isBettingAllowed = !disabled && !isMatchClosed && isQuestionOpen && (!liveOnly || matchStatus === 'live');

  // Close the bet input if betting becomes disallowed
  useEffect(() => {
    if (!isBettingAllowed) {
      setSelectedOpt(null);
      setAmount('');
    }
  }, [isBettingAllowed]);

  const handleOptionClick = (opt) => {
    if (!isBettingAllowed) return;
    setSelectedOpt(opt);
    setAmount("");
  };

  const handleCancel = () => {
    setSelectedOpt(null);
    setAmount("");
  };

  const handleSubmit = () => {
    if (selectedOpt && amount && Number(amount) > 0) {
      onSelect(selectedOpt, Number(amount), selectedOpt.odds);
      setSelectedOpt(null);
      setAmount("");
    }
  };

  return (
    <div
      className={`bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start mb-4">
        <div className="flex gap-2 flex-1 min-w-0 pr-20">
          <div className="p-2 bg-white/10 text-teal-400 rounded-xl border border-white/5">
            <HelpCircle size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {question.categoryName}
            </p>

            <h4 className="text-sm font-bold text-white leading-snug">
              {question.question}
            </h4>
          </div>
        </div>
      </div>

      {/* Fixed timer/status in top-right */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        {question.autoCloseAt ? (
          <span className="text-xs font-bold text-red-500 whitespace-nowrap">
            {new Date(question.autoCloseAt).toLocaleString()}
          </span>
        ) : typeof timer === "number" && timer > 0 ? (
          <span className="text-xs font-bold text-red-500">
            {String(Math.floor(timer / 60)).padStart(2, "0")}:
            {String(timer % 60).padStart(2, "0")}
          </span>
        ) : null}

        <span className="text-[10px] h-[22px] font-semibold bg-white/10 px-2 py-1 rounded-lg text-white/50 border border-white/5">
          {question.status}
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOpt?.label === opt.label;
          const baseBg =
            idx === 0 ? "bg-emerald-500/10" : idx === 1 ? "bg-red-500/10" : "bg-white/5";
          return (
            <button
              key={opt.label}
              onClick={() => handleOptionClick(opt)}
              disabled={!isBettingAllowed}
              className={`p-3 rounded-lg border text-center transition ${baseBg} ${
                !isBettingAllowed
                  ? 'opacity-60 cursor-not-allowed border-white/5'
                  : isSelected
                  ? 'border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.3)] bg-teal-400/20'
                  : 'border-white/10 hover:border-teal-400/50'
              }`}
            >
              <p className={`font-bold text-sm ${isSelected ? 'text-teal-400' : 'text-white/80'}`}>{opt.label}</p>

              {opt.odds && (
                <span className={`flex justify-center items-center gap-1 text-xs mt-1 font-mono ${isSelected ? 'text-teal-300' : 'text-teal-500/70'}`}>
                  <TrendingUp size={10} /> {opt.odds}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Betting Section */}
      {selectedOpt && (
        <div className="mt-4 border-t border-white/10 pt-4 animate-slide-up">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-white/40">Enter Amount</span>

            <span className="font-bold text-teal-400">
              {selectedOpt.label}
            </span>
          </div>

          <div className="relative mb-3">
            <IndianRupee
              size={16}
              className="absolute left-3 top-2.5 text-white/30"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-teal-400/50 outline-none transition"
            />
          </div>

          {/* Potential Win */}
          {selectedOpt.odds && amount > 0 && (
            <div className="flex justify-between text-xs mb-3">
              <span className="text-white/40">Potential Win</span>

              <span className="text-emerald-400 font-bold">
                ₹ {(Number(amount) * Number(selectedOpt.odds)).toFixed(2)}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:bg-white/10 transition"
            >
              <X size={12} className="inline mr-1" />
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isBettingAllowed || !amount || Number(amount) <= 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl text-xs font-bold shadow-lg shadow-teal-500/20 disabled:opacity-30 transition transform active:scale-95"
            >
              <Check size={12} className="inline mr-1" />
              Place Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
