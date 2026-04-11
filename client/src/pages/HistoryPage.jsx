import { useEffect, useState } from 'react';
import BetCard from '../components/cards/BetCard.jsx';
import { useBetStore } from '../store/betStore.js';
import { CalendarRange, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;
const filters = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' }
];

export default function HistoryPage() {
  const { bets, fetchBets, loading, totalPages } = useBetStore();
  const [filter, setFilter] = useState('week');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBets({ range: filter, page, limit: PAGE_SIZE });
  }, [filter, page]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Cricbazzi | Betting History";
  }, []);


  return (
    <div className="space-y-6 pt-2 min-h-screen bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f]  px-4 pb-20 relative overflow-hidden">
      {/* Glow Effects */}
      {/* <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full -z-10"></div> */}
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity size={24} className="text-teal-400" />
          Betting History
        </h2>
        <CalendarRange size={20} className="text-white/30" />
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
  {filters.map((f) => (
    <button
      key={f.key}
      onClick={() => { setFilter(f.key); setPage(1); }}
      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
        filter === f.key
          ? 'bg-teal-500 text-white'
          : 'text-white/60 hover:bg-white/10'
      }`}
    >
      {f.label}
    </button>
  ))}
</div>
      </div>

      <div className="space-y-3 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1220]/50 backdrop-blur-sm z-10 rounded-2xl">
            <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-teal-400 animate-spin mb-4"></div>
          </div>
        )}
        
        <div className="space-y-3">
          {bets.map((b) => (
            <BetCard bet={b} key={b._id} />
          ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-white/40">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        
        {!loading && !bets.length && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 border-dashed">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white/30">
              <CalendarRange size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No bets found</h3>
            <p className="text-white/40 text-sm mt-1 px-8">You haven't placed any bets in this time period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
