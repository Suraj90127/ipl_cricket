import { useEffect, useState } from 'react';
import StatCard from '../components/cards/StatCard.jsx';
import BetCard from '../components/cards/BetCard.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useBetStore } from '../store/betStore.js';
import { useWalletStore } from '../store/walletStore.js';
import { useNavigate } from 'react-router-dom';
import {  ChevronRight, Crown, ChevronLeft } from 'lucide-react';

   import { Trophy, Activity, TrendingDown, IndianRupee } from "lucide-react";
const BETS_PAGE_SIZE = 5;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { bets, fetchBets, page, totalPages, stats, fetchStats } = useBetStore();
  const { balance, fetchTransactions } = useWalletStore();
  const navigate = useNavigate();
  const [betsPage, setBetsPage] = useState(1);

  useEffect(() => {
    fetchBets({ limit: BETS_PAGE_SIZE, page: betsPage });
  }, [betsPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);
    useEffect(() => {
   window.scrollTo(0, 0);
  }, [user]);

  return (
    <div className="space-y-6 pt-2 ">
   


<div className="grid grid-cols-2 gap-4">

  <StatCard
    icon={<Activity size={18} />}
    label="Total Bets"
    value={stats?.totalBets ?? user?.stats?.totalBets ?? bets.length}
    className="bg-white border border-gray-100 shadow-sm"
  />

  <StatCard
    icon={<Trophy size={18} />}
    label="Wins"
    value={stats?.wins ?? user?.stats?.wins ?? bets.filter((b) => b.result === "win").length}
    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
  />

  <StatCard
    icon={<TrendingDown size={18} />}
    label="Losses"
    value={stats?.losses ?? user?.stats?.losses ?? bets.filter((b) => b.result === "loss").length}
    className="bg-white border border-gray-100 shadow-sm"
  />

  <StatCard
    icon={<IndianRupee size={18} />}
    label="Win Amount"
    value={`₹${stats?.winAmount ?? user?.stats?.winAmount ?? (bets.filter(b => b.result === 'win').reduce((s, b) => s + (Number(b.profit) || 0), 0)) ?? 0}`}
    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
  />

</div>

      <section className="space-y-4 relative z-10">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-accent" />
            Recent Bets
          </h2>
          <button className="text-sm font-semibold text-accent flex items-center hover:underline" onClick={() => navigate('/history')}>
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {bets.map((bet) => (
            <BetCard bet={bet} key={bet._id} />
          ))}
          {!bets.length && (
            <div className="text-center py-10 opacity-60 bg-white/50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500 font-medium tracking-wide">No recent bets</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setBetsPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs font-bold text-slate-500">Page {page} / {totalPages}</span>
              <button
                onClick={() => setBetsPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>


    </div>
  );
}

