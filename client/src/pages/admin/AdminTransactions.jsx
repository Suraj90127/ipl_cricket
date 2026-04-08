import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const TYPE_TABS = ['all', 'recharge', 'withdraw', 'bet', 'winning'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-600',
  done: 'bg-green-100 text-green-600',
  approved: 'bg-green-100 text-green-600',
  rejected: 'bg-red-100 text-red-600',
  requested: 'bg-amber-100 text-amber-600',
};
const PAGE_SIZE = 10;

export default function AdminTransactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    adminService.getTransactions({ type: type === 'all' ? '' : type, status, page, limit: PAGE_SIZE })
      .then((data) => { setTxns(data.transactions ?? []); setTotalPages(data.totalPages ?? 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type, status, page]);

  useEffect(() => { setPage(1); }, [type, status]);

  return (
    <div className="space-y-4">
      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition ${type === t ? 'bg-accent text-white' : 'border border-slate-200 text-slate-500 hover:border-accent hover:text-accent'}`}>
            {t}
          </button>
        ))}
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="ml-auto border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-accent">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="requested">Requested</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-center px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Note</th>
                  <th className="text-right px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txns.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.userId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 capitalize">{t.type}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${t.type === 'withdraw' || t.type === 'bet' ? 'text-red-500' : 'text-green-600'}`}>
                      ₹{t.amount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-400'}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[140px] truncate">{t.description || t.note || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">{format.dateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!txns.length && <div className="text-center py-12 text-slate-400 text-sm">No transactions found</div>}
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
