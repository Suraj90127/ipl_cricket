import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import { CheckCircle, XCircle } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const PAGE_SIZE = 10;

export default function AdminRecharge() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    adminService.getTransactions({ type: 'recharge', status: 'pending', page, limit: PAGE_SIZE })
      .then((data) => { setTxns(data.transactions ?? []); setTotalPages(data.totalPages ?? 1); })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handle = (id, status) => {
    setActionId(id);
    adminService.updateTransaction(id, { status })
      .then(load)
      .catch(() => alert('Error updating'))
      .finally(() => setActionId(null));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700">{txns.length} Pending Recharge Requests</span>
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
                  <th className="text-right px-4 py-3">Requested At</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txns.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.userId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.userId?.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">₹{t.amount}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[180px]">
                      {t.utrId ? (
                        <span className=" text-black font-bold">{t.utrId}</span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}

                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">{format.dateTime(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          disabled={actionId === t._id}
                          onClick={() => handle(t._id, 'done')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 disabled:opacity-40 transition">
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          disabled={actionId === t._id}
                          onClick={() => handle(t._id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 disabled:opacity-40 transition">
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!txns.length && <div className="text-center py-12 text-slate-400 text-sm">No pending recharge requests</div>}
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
