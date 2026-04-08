import { useEffect, useMemo, useState } from 'react';
import { useLiveUpdates } from '../hooks/useLiveUpdates.js';
import { useParams } from 'react-router-dom';
import PredictionCard  from '../components/cards/PredictionCard.jsx';
import { useMatchStore } from '../store/matchStore.js';
import { useBetStore } from '../store/betStore.js';
import { useWalletStore } from '../store/walletStore.js';
import { useSocket } from '../providers/SocketProvider.jsx';
import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MatchDetailsPage() {
  useLiveUpdates();
  const baseCategories = ['All', 'Overs', 'Run', 'Player', 'Wicket','Toss'];
  const { id } = useParams();
  const { selectedMatch, questions, fetchMatch, fetchQuestions } = useMatchStore();
  const { placeBet } = useBetStore();
  const { balance, fetchTransactions } = useWalletStore();
  const socket = useSocket();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    fetchMatch(id);
    fetchQuestions(id);
  }, [id]);

  useEffect(() => {
    fetchTransactions().catch(() => {});
  }, [fetchTransactions]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join:match', id);
  }, [socket, id]);
  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  const getCategoryLabel = (question) => (question.categoryName || 'Other').trim();

  const matchesCategory = (question, category) => {
    if (category === 'All') return true;
    const normalized = getCategoryLabel(question).toLowerCase();
    const target = category.toLowerCase();
    if (target === 'run') return normalized.includes('run');
    if (target === 'player') return normalized.includes('player');
    if (target === 'wicket') return normalized.includes('wicket');
    if (target === 'overs') return normalized.includes('over');
    return normalized === target;
  };

  const matchesStatus = (question, status) => {
    if (!status) return true;
    const qStatus = (question.status || '').toLowerCase();
    return qStatus === status;
  };

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(questions.map(getCategoryLabel))).filter(Boolean);
    const ordered = dynamic.filter((label) => !baseCategories.includes(label));
    return [...baseCategories, ...ordered];
  }, [questions]);

  const filteredQuestions = useMemo(
    () => questions.filter((question) => matchesCategory(question, activeCategory) && matchesStatus(question, statusFilter)),
    [questions, activeCategory, statusFilter]
  );
console.log("selectedMatch", selectedMatch);

const handleSelect = async (opt, amount, status, odds, questionId) => {
  setMessage({ text: "", type: "" });

  if (!selectedMatch) return;

  // ❌ Match finished
  if (selectedMatch.status?.toLowerCase() === "finished") {
    setMessage({ text: "Betting is closed for this match", type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return;
  }

  // ❌ Invalid amount
  if (!amount || amount <= 0) {
    setMessage({ text: "Enter a valid amount", type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return;
  }

  // ❌ Option closed
  if (status === "closed") {
    setMessage({ text: "Betting is closed for this option", type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return;
  }

  // ❌ Minimum bet
  if (amount < 10) {
    setMessage({ text: "Minimum bet amount is 10", type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return;
  }

  // ❌ Balance check
  if (amount > balance) {
    setMessage({ text: "Insufficient balance", type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return;
  }

  // ✅ Playing team score logic
  const playingTeamScore =
    selectedMatch.playingTeam === selectedMatch.teamA
      ? selectedMatch.teamAScore
      : selectedMatch.teamBScore;

  try {
    await placeBet({
      matchId: id,
      questionId,
      selectedOption: opt.label,
      amount,
      odds: opt.odds,

      // 👇 store snapshot
      playingTeam: selectedMatch.playingTeam,
      score: playingTeamScore
    });

    setMessage({ text: "Bet placed successfully!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);

  } catch (err) {
    setMessage({
      text: err.response?.data?.message ?? "Failed to place bet",
      type: "error"
    });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }
};
  const isLive = selectedMatch?.status?.toLowerCase() === 'live';

  return (
    <div className="space-y-6 pt-2">
      {selectedMatch && (
        <div className="p-4 rounded-3xl premium-card group relative overflow-hidden bg-orange-100 border border-slate-100 mb-6">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full -ml-10 -mt-10 blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
              Match Info
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
                Bal: ₹{balance.toFixed(2)}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${isLive ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                {selectedMatch.status}
              </span>
            </div>
          </div>
          
        <div className="flex items-center justify-between py-4">

  {/* Team A */}
  <div className="flex flex-col items-center w-1/3">

    <div className="w-16 h-16 p-1 rounded-full bg-blue-200 border border-blue-600 shadow-sm hover:shadow-md transition">
      <img
        src={selectedMatch.teamALogo}
        alt={selectedMatch.teamA}
        className="w-full h-full rounded-full object-cover"
      />
    </div>

    <h2 className="mt-2 text-sm font-semibold text-gray-800 text-center">
      {selectedMatch.teamA}
    </h2>

  </div>


  {/* Score / VS */}
 <div className="flex flex-col items-center justify-center w-1/3">

  {(selectedMatch.teamAScore || selectedMatch.teamBScore) ? (
    <div className="flex flex-col items-center justify-center ">
      <span className="px-2 py-1 mb-1 rounded-lg text-sm font-bold  bg-red-600 text-white">
        {selectedMatch.teamAScore || '-'}
      </span>
      <span className="px-2 py-1 rounded-lg text-xs font-bold  bg-blue-600 text-white">
        {selectedMatch.teamBScore || '-'}
      </span>
    </div>
  ) : (
    <div className="flex items-center justify-center w-16 h-8 rounded-full 
    bg-gray-100 text-gray-500 font-bold text-xs border border-gray-200">
      VS
    </div>
  )}

</div>


  {/* Team B */}
  <div className="flex flex-col items-center w-1/3">

    <div className="w-16 h-16 p-1 rounded-full bg-red-200 border border-red-600 shadow-sm hover:shadow-md transition">
      <img
        src={selectedMatch.teamBLogo}
        alt={selectedMatch.teamB}
        className="w-full h-full rounded-full object-cover"
      />
    </div>

    <h2 className="mt-2 text-sm font-semibold text-gray-800 text-center">
      {selectedMatch.teamB}
    </h2>

  </div>

</div>
        </div>
      )}

      {message.text && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-fade-in w-11/12 max-w-sm">
          <div className={`p-4 rounded-xl shadow-premium flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
            {message.type === 'error' ? <AlertCircle size={22} className="shrink-0" /> : <CheckCircle2 size={22} className="shrink-0" />}
            <p className="text-sm font-bold tracking-wide">{message.text}</p>
          </div>
        </div>
      )}

  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">

    <div className="flex gap-2 overflow-x-auto scrollbar-hide">

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition ${
            activeCategory === category
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {category}
        </button>
      ))}

    </div>

    <div className="flex items-center gap-2 mt-3">
      <button
        type="button"
        onClick={() => setStatusFilter('open')}
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          statusFilter === 'open' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        Open
      </button>

      <button
        type="button"
        onClick={() => setStatusFilter('closed')}
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          statusFilter === 'closed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        Closed
      </button>
    </div>

  </div>

      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <PredictionCard
              key={q._id}
              question={q}
              match={selectedMatch}
              onSelect={(opt, amount) => handleSelect(opt, amount, q.status, opt.odds, q._id)}
            />
          ))
        ) : (
          <div className="text-center py-10 opacity-60">
            <p className="text-slate-500 font-medium">No predictions available for {activeCategory}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
