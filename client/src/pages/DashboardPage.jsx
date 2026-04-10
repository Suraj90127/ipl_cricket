import { useEffect, useState } from 'react';
import StatCard from '../components/cards/StatCard.jsx';
import BetCard from '../components/cards/BetCard.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useBetStore } from '../store/betStore.js';
import { useWalletStore } from '../store/walletStore.js';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Crown, ChevronLeft } from 'lucide-react';
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
    <div className="space-y-6 px-4 min-h-screen pb-28
    bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f] relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 relative z-10">

        <StatCard
          icon={<Activity size={18} />}
          label="Total Bets"
          value={stats?.totalBets ?? user?.stats?.totalBets ?? bets.length}
          className="bg-white/5 border border-white/10 backdrop-blur-xl text-white shadow-lg"
        />

        <StatCard
          icon={<Trophy size={18} />}
          label="Wins"
          value={stats?.wins ?? user?.stats?.wins ?? bets.filter((b) => b.result === "win").length}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-lg"
        />

        <StatCard
          icon={<TrendingDown size={18} />}
          label="Losses"
          value={stats?.losses ?? user?.stats?.losses ?? bets.filter((b) => b.result === "loss").length}
          className="bg-white/5 border border-white/10 backdrop-blur-xl text-white shadow-lg"
        />

        <StatCard
          icon={<IndianRupee size={18} />}
          label="Win Amount"
          value={`₹${stats?.winAmount ?? user?.stats?.winAmount ?? (bets.filter(b => b.result === 'win').reduce((s, b) => s + (Number(b.profit) || 0), 0)) ?? 0}`}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg"
        />

      </div>

      {/* Recent Bets */}
      <section className="space-y-4 relative z-10">

        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Activity size={20} className="text-teal-400" />
            Recent Bets
          </h2>

          <button
            className="text-sm font-semibold text-teal-400 flex items-center hover:underline"
            onClick={() => navigate('/history')}
          >
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">

          {bets.map((bet) => (
            <div
              key={bet._id}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg"
            >
              <BetCard bet={bet} />
            </div>
          ))}

          {!bets.length && (
            <div className="text-center py-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-white/50 font-medium tracking-wide">
                No recent bets
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">

              <button
                onClick={() => setBetsPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 
                bg-white/5 backdrop-blur px-3 py-1.5 text-xs font-bold text-white/70 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span className="text-xs font-bold text-white/50">
                Page {page} / {totalPages}
              </span>

              <button
                onClick={() => setBetsPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 
                bg-white/5 backdrop-blur px-3 py-1.5 text-xs font-bold text-white/70 disabled:opacity-40"
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