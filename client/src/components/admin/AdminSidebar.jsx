import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Ticket, RadioTower, Trophy,
  HelpCircle, ArrowLeftRight, CreditCard, Wallet,
  CheckCircle, Settings, LogOut, ChevronRight, X, History
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { FiGift } from "react-icons/fi";

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'All Users', icon: Users },
  { to: '/admin/bets', label: 'All Bets', icon: Ticket },
  { to: '/admin/live-bets', label: 'Live Bets', icon: RadioTower },
  { to: '/admin/live-questions', label: 'Live Questions', icon: RadioTower },
  { to: '/admin/matches', label: 'Matches', icon: Trophy },
  { to: '/admin/templates', label: 'Templates', icon: Ticket },
  { to: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/admin/Upi-Upadte', label: 'Upi Settings', icon: CheckCircle },
  { to: '/admin/recharge', label: 'Recharge Requests', icon: CreditCard },
  { to: '/admin/recharge-history', label: 'Recharge History', icon: History },
  { to: '/admin/withdraw', label: 'Withdraw Requests', icon: Wallet },
  { to: '/admin/withdraw-history', label: 'Withdraw History', icon: History },
  { to: '/admin/gift', label: 'Gift', icon: FiGift  },
  { to: '/admin/results', label: 'Game Results', icon: CheckCircle },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 shadow-lg z-40 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cricket Pro</p>
            <h2 className="text-lg font-black text-slate-800">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto max-h-screen py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-accent' : 'text-slate-400 group-hover:text-slate-700'} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-accent" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
