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

  return (
    <div className="space-y-6 pt-2 ">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Activity size={24} className="text-accent" />
          Betting History
        </h2>
        <CalendarRange size={20} className="text-slate-400" />
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                filter === f.key 
                  ? 'border-accent bg-accent text-white shadow-glow' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-2xl">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-accent animate-spin mb-4"></div>
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
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-accent hover:text-accent transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-accent hover:text-accent transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        
        {!loading && !bets.length && (
          <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-3xl border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <CalendarRange size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-700">No bets found</h3>
            <p className="text-slate-500 text-sm mt-1 px-8">You haven't placed any bets in this time period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
