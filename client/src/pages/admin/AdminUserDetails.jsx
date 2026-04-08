import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService.js';
import { ArrowLeft } from 'lucide-react';

const TABS = ['recharge', 'withdraw', 'bets'];

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recharge');

  useEffect(() => {
    adminService.getUserDetails(id)
      .then(setData)
      .catch(() => alert('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return null;

  const { user, rechargeHistory, withdrawHistory, bets } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h2>
          <p className="text-sm text-slate-400">{user.phone}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Balance" value={`₹${user.balance ?? 0}`} color="text-emerald-600" />
        <InfoCard label="Total Bets" value={bets.length} />
        <InfoCard label="Status" value={user.status} color={user.status === 'blocked' ? 'text-red-500' : 'text-emerald-500'} />
        <InfoCard label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              tab === t ? 'bg-accent text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-accent hover:text-accent'
            }`}>
            {t === 'recharge' ? `Recharge (${rechargeHistory.length})` : t === 'withdraw' ? `Withdraw (${withdrawHistory.length})` : `Bets (${bets.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {tab === 'recharge' && (
            rechargeHistory.length === 0 ? <Empty label="No recharge history" /> :
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rechargeHistory.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{r.amount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} map={{ done: 'emerald', rejected: 'red', pending: 'amber' }} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'withdraw' && (
            withdrawHistory.length === 0 ? <Empty label="No withdrawal history" /> :
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">UPI ID</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {withdrawHistory.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-red-500">₹{w.amount}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{w.upiId || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.status} map={{ approved: 'emerald', rejected: 'red', requested: 'amber' }} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(w.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'bets' && (
            bets.length === 0 ? <Empty label="No bet history" /> :
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Match</th>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Pick</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bets.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[140px] truncate">{b.matchName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">{b.question || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{b.selectedOption}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹{b.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={b.result ?? 'pending'} map={{ win: 'emerald', loss: 'red', pending: 'amber' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const InfoCard = ({ label, value, color = 'text-slate-800' }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`font-extrabold text-lg ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status, map }) => {
  const color = map[status] ?? 'slate';
  const cls = { emerald: 'bg-emerald-100 text-emerald-600', red: 'bg-red-100 text-red-600', amber: 'bg-amber-100 text-amber-600', slate: 'bg-slate-100 text-slate-500' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cls[color]}`}>{status}</span>;
};

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

const Empty = ({ label }) => (
  <div className="text-center py-12 text-slate-400 text-sm font-medium">{label}</div>
);
