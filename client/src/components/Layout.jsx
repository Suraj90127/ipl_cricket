import { Outlet, useLocation, Link } from 'react-router-dom';
import BottomNavbar from './navigation/BottomNavbar.jsx';
import HeaderBar from './navigation/HeaderBar.jsx';
import { useAuthStore } from '../store/authStore.js';
import { AlertCircle } from 'lucide-react';

const hideChromeRoutes = ['/login', '/signup', '/forgot-password'];

export default function Layout() {
  const { pathname } = useLocation();
  const hideChrome = hideChromeRoutes.includes(pathname);
  const { user } = useAuthStore();

  if (hideChrome) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#152727] text-slate-800 flex flex-col relative selection:bg-accent/20">
      {/* Global Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -ml-40 -mb-20"></div>
      </div>

      <HeaderBar />
      <main className="flex-1 px-4 sm:px-6 md:px-8 pb-28 pt-4 relative z-10 max-w-3xl mx-auto w-full">
        
        <div className="animate-fade-in w-full max-w-md m-auto">
          <Outlet />
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}
