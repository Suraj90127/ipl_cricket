import { useEffect, useState } from 'react';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import { RefreshCw } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const PAGE_SIZE = 10;



export default function AdminLiveBets() {
  
const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socket = useSocket();

  const load = () => {
    setLoading(true);
    adminService.getLiveBets({ page, limit: PAGE_SIZE })
      .then((data) => { setBets(data.bets ?? []); setTotalPages(data.totalPages ?? 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);
  useEffect(() => { setPage(1); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { load(); };
    socket.on('bet:new', handler);
    return () => socket.off('bet:new', handler);
  }, [socket, page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-sm font-bold text-slate-700">{bets.length} Live Bets Active</span>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-accent hover:text-accent transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Match</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Option</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Odds</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Q.Status</th>
                  <th className="text-right px-4 py-3">Placed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bets.map((bet) => (
                  <tr key={bet._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{bet.userId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {bet.matchId ? `${bet.matchId.teamA} vs ${bet.matchId.teamB}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{bet.matchId?.score ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{bet.questionId?.question ?? '—'}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{bet.selectedOption}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹{bet.amount}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{bet.odds}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹{bet.amount* bet.odds}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 uppercase">
                        {bet.questionId?.status ?? 'open'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">{format.dateTime(bet.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bets.length && <EmptyRow />}
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

const EmptyRow = () => (
  <div className="text-center py-12 text-slate-400 text-sm font-medium">No live bets right now</div>
);
