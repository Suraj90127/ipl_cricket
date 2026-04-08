import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const PAGE_SIZE = 10;

export default function AdminRechargeHistory() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('done');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    adminService.getTransactions({ type: 'recharge', status, page, limit: PAGE_SIZE })
      .then((data) => {
        setTxns(data.transactions ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {['done', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold capitalize transition ${status === s ? 'bg-accent text-white border-accent' : 'border-slate-200 text-slate-500 hover:border-accent hover:text-accent'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Note / UTR</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txns.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.userId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.userId?.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{t.amount}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[160px] truncate">{t.description || t.note || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">{format.dateTime(t.updatedAt || t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!txns.length && <div className="text-center py-12 text-slate-400 text-sm">No recharge history found</div>}
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
