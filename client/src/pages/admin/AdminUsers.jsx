import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService.js';
import { ShieldOff, ShieldCheck, Wallet, Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [walletModal, setWalletModal] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState('add');
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    adminService.getUsers({ search, page, limit: PAGE_SIZE })
      .then((data) => { setUsers(data.users ?? []); setTotalPages(data.totalPages ?? 1); setTotal(data.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, page]);
  useEffect(() => { setPage(1); }, [search]);

  const handleBlock = async (id, action) => {
    try {
      if (action === 'block') await adminService.blockUser(id);
      else await adminService.unblockUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed');
    }
  };

  const handleWallet = async () => {
    try {
      await adminService.adjustWallet(walletModal.userId, { amount: walletAmount, type: walletType });
      setMsg(`Wallet ${walletType === 'add' ? 'credited' : 'debited'} successfully`);
      setWalletAmount('');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message ?? 'Failed');
    }
  };

  const filtered = users;
  const totalPagesVal = totalPages;
  const paginated = users;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search by name, phone or email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm text-black rounded-xl border border-slate-200 focus:outline-none focus:border-accent bg-white"
          />
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">{total} users</span>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  {/* <th className="text-left px-4 py-3">Email</th> */}
                  <th className="text-right px-4 py-3">Wallet</th>
                  <th className="text-right px-4 py-3">Bets</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-slate-500">{user.phone}</td>
                    {/* <td className="px-4 py-3 text-slate-500">{user.email}</td> */}
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{user.balance}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{user.totalBets}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setWalletModal({ userId: user._id, name: user.name })}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition"
                          title="Adjust wallet"
                        >
                          <Wallet size={14} />
                        </button>
                        {user.status === 'blocked' ? (
                          <button
                            onClick={() => handleBlock(user._id, 'unblock')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition"
                            title="Unblock"
                          >
                            <ShieldCheck size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(user._id, 'block')}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            title="Block"
                          >
                            <ShieldOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <EmptyRow />}
          </div>
          <PaginationControls page={page} totalPages={totalPagesVal} onPageChange={setPage} />
        </div>
      )}

      {/* Wallet Modal */}
      {walletModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-slate-800">Adjust Wallet — {walletModal.name}</h3>
            <div className="flex gap-2">
              <button onClick={() => setWalletType('add')} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${walletType === 'add' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-500'}`}>
                <ChevronUp size={14} className="inline mr-1" /> Add
              </button>
              <button onClick={() => setWalletType('deduct')} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition ${walletType === 'deduct' ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 text-slate-500'}`}>
                <ChevronDown size={14} className="inline mr-1" /> Deduct
              </button>
            </div>
            <input
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-slate-200 rounded-xl text-black px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            {msg && <p className="text-xs text-accent font-semibold">{msg}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setWalletModal(null); setMsg(''); setWalletAmount(''); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold">Cancel</button>
              <button onClick={handleWallet} className="flex-1 py-2.5 rounded-xl bg-accent text-slate-900 text-sm font-bold">Confirm</button>
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
  <div className="text-center py-12 text-slate-400 text-sm font-medium">No users found</div>
);
