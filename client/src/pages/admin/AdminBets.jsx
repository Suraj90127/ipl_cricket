import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { Filter } from 'lucide-react';
import { format } from '../../utils/format.js';
import PaginationControls from '../../components/admin/PaginationControls.jsx';
import { useBetStore } from '../../store/betStore.js';
import { RiDeleteBin6Line } from "react-icons/ri";

const PAGE_SIZE = 10;

const RESULT_COLORS = {
  win: 'bg-emerald-100 text-emerald-600',
  loss: 'bg-red-100 text-red-600',
  pending: 'bg-amber-100 text-amber-600'
};

export default function AdminBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ updated filter state
  const [filter, setFilter] = useState({
    result: '',
    today: false,
    phone: ''
  });

  const { deleteBet } = useBetStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔥 API call
  const load = () => {
    setLoading(true);

    const params = { page, limit: PAGE_SIZE };

    if (filter.result) params.result = filter.result;
    if (filter.today) params.today = 'true';
    if (filter.phone) params.phone = filter.phone; // ✅ NEW

    adminService.getBets(params)
      .then((data) => {
        setBets(data.bets ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  // open popup
  const handleDelete = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  // confirm delete
  const confirmDeleteBet = async () => {
    if (!selectedId) return;

    setDeleting(true);
    const success = await deleteBet(selectedId);

    setDeleting(false);
    setShowConfirm(false);
    setSelectedId(null);

    if (success) load();
  };

  // 🔥 debounce for smooth typing
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 400);

    return () => clearTimeout(t);
  }, [filter, page]);

  return (
    <div className="space-y-4">

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Filter size={14} /> Filter:
        </div>

        {/* ✅ Result filters */}
        {['', 'pending', 'win', 'loss'].map((r) => (
          <button
            key={r}
            onClick={() => {
              setFilter((f) => ({ ...f, result: r }));
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition ${filter.result === r
                ? 'bg-accent text-white border-accent'
                : 'border-slate-200 text-slate-500 hover:border-accent hover:text-accent'
              }`}
          >
            {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}

        {/* ✅ Today filter */}
        <button
          onClick={() => {
            setFilter((f) => ({ ...f, today: !f.today }));
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full border text-xs font-bold transition ${filter.today
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'border-slate-200 text-slate-500 hover:border-indigo-400'
            }`}
        >
          Today Only
        </button>

        {/* 🔥 NEW: Phone search */}
        <input
          type="text"
          placeholder="Search phone..."
          value={filter.phone}
          onChange={(e) => {
            setFilter((f) => ({ ...f, phone: e.target.value }));
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-black text-xs font-semibold outline-none focus:border-indigo-400"
        />
        <button
          onClick={() => {
            setFilter({ result: '', today: false, phone: '' });
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-500 text-xs font-bold hover:bg-red-50 transition"
        >
          Reset
        </button>

        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
          {bets.length} bets
        </span>
      </div>

      {/* 📊 Table */}
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Match</th>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Option</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Result</th>
                  <th className="text-right px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {bets.map((bet) => (
                  <tr key={bet._id} className="hover:bg-slate-50">

                    {/* User */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div className="flex flex-col">
                        {bet.userId?.name ?? '—'}
                        <span className="text-gray-400 text-xs mt-1">
                          {bet.userId?.phone}
                        </span>
                      </div>
                    </td>

                    {/* Match */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {bet.matchId
                        ? `${bet.matchId.teamA} vs ${bet.matchId.teamB}`
                        : bet.matchName ?? '—'}
                    </td>

                    {/* Question */}
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                      {bet.questionId?.question ?? bet.question ?? '—'}
                    </td>

                    {/* Option */}
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {bet.selectedOption}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      ₹{bet.amount}
                    </td>

                    {/* Result */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${RESULT_COLORS[bet.result] ??
                          'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {bet.result}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">
                      {format.dateTime(bet.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(bet._id)}
                        className="text-red-500 text-xl font-bold hover:underline"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!bets.length && <EmptyRow />}
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">

            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Delete Bet?
            </h2>

            <p className="text-sm text-slate-500 mb-5">
              Are you sure you want to delete this bet? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteBet}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>

            </div>
          </div>
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
  <div className="text-center py-12 text-slate-400 text-sm font-medium">
    No bets found
  </div>
);