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
      className={`bg-white border border-gray-100 rounded-xl shadow-sm p-4 relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start mb-4">
        <div className="flex gap-2 flex-1 min-w-0 pr-20">
          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
            <HelpCircle size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase">
              {question.categoryName}
            </p>

            <h4 className="text-sm font-bold text-gray-800">
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

        <span className="text-[10px] h-[22px] font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">
          {question.status}
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOpt?.label === opt.label;
          const baseBg =
            idx === 0 ? "bg-green-50" : idx === 1 ? "bg-red-50" : "bg-gray-100";
          return (
            <button
              key={opt.label}
              onClick={() => handleOptionClick(opt)}
              disabled={!isBettingAllowed}
              className={`p-3 rounded-lg border text-center transition ${baseBg} ${
                !isBettingAllowed
                  ? 'opacity-60 cursor-not-allowed border-gray-200'
                  : isSelected
                  ? 'border-indigo-600'
                  : 'border-gray-200 hover:border-indigo-400'
              }`}
            >
              <p className="font-bold text-sm">{opt.label}</p>

              {opt.odds && (
                <span className="flex justify-center items-center gap-1 text-xs text-indigo-500 mt-1">
                  <TrendingUp size={12} /> {opt.odds}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Betting Section */}
      {selectedOpt && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-gray-500">Enter Amount</span>

            <span className="font-semibold text-indigo-600">
              {selectedOpt.label}
            </span>
          </div>

          <div className="relative mb-3">
            <IndianRupee
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Potential Win */}
          {selectedOpt.odds && amount > 0 && (
            <div className="flex justify-between text-xs mb-3">
              <span className="text-gray-500">Potential Win</span>

              <span className="text-green-600 font-bold">
                ₹ {(Number(amount) * Number(selectedOpt.odds)).toFixed(2)}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200"
            >
              <X size={14} className="inline mr-1" />
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isBettingAllowed || !amount || Number(amount) <= 0}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check size={14} className="inline mr-1" />
              Place Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
