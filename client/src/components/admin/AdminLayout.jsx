import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { adminService } from '../../services/adminService.js';

const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/users': 'All Users',
  '/admin/bets': 'All Bets',
  '/admin/live-bets': 'Live Bets',
  '/admin/matches': 'Matches',
  '/admin/templates': 'Templates Manager',
  '/admin/questions': 'Prediction Questions',
  '/admin/transactions': 'Transactions',
  '/admin/recharge': 'Recharge Requests',
  '/admin/withdraw': 'Withdraw Requests',
  '/admin/results': 'Game Results',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const title = routeTitles[pathname] ?? 'Admin Panel';
  const SETTINGS_KEY = 'admin-panel-settings';
  const [banner, setBanner] = useState({ bannerEnabled: false, bannerText: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getSettings();
        if (res && Object.keys(res).length) {
          setBanner({ bannerEnabled: !!res.bannerEnabled, bannerText: String(res.bannerText || ''), bannerImageUrl: String(res.bannerImageUrl || '') });
          return;
        }
      } catch (err) {
        // fallback to localStorage
      }

      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setBanner({ bannerEnabled: !!parsed.bannerEnabled, bannerText: String(parsed.bannerText || ''), bannerImageUrl: String(parsed.bannerImageUrl || '') });
      } catch (e) {
        // ignore
      }
    };

    load();

    const handler = (e) => {
      if (e.key !== SETTINGS_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || '{}');
        setBanner({ bannerEnabled: !!parsed.bannerEnabled, bannerText: String(parsed.bannerText || ''), bannerImageUrl: String(parsed.bannerImageUrl || '') });
      } catch { }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 relative">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-700">{user?.name ?? 'Admin'}</p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

    

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
