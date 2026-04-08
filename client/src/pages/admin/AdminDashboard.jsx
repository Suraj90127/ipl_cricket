import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { Users, Ticket, RadioTower, TrendingUp, ArrowDownCircle, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value ?? '—'}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="bg-indigo-500" />
        <StatCard label="Total Bets" value={stats?.totalBets} icon={Ticket} color="bg-amber-500" />
        <StatCard label="Live Bets" value={stats?.liveBets} icon={RadioTower} color="bg-red-500" />
        <StatCard label="Revenue" value={`₹${stats?.totalRevenue ?? 0}`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Withdrawals" value={`₹${stats?.totalWithdrawals ?? 0}`} icon={ArrowDownCircle} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-accent" /> Daily Bets (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7 ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="bets" fill="#00e676" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" /> Daily Revenue (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.last7 ?? []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
