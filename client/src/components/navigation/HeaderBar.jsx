import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { useWalletStore } from "../../store/walletStore.js";
import { LogIn, ChevronLeft, Wallet } from "lucide-react";

export default function HeaderBar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { balance: walletBalance } = useWalletStore();
  const navigate = useNavigate();

  const title = pathTitle(pathname);

  const showBack =
    pathname !== "/" &&
    pathname !== "/matches" &&
    pathname !== "/wallet" &&
    pathname !== "/history" &&
    pathname !== "/profile";

  const balance =
    Number.isFinite(walletBalance)
      ? walletBalance.toFixed(2)
      : user?.balance?.toFixed(2) ?? "0.00";

  return (
    <header className="sticky top-0 z-50 w-full max-w-md mx-auto bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">

      {/* left */}
      <div className="flex items-center ">

        {showBack && (
          <Link
            to=".."
            relative="path"
            className="p-2 rounded-xl text-white/60 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
        )}

        <h1 className="text-base font-bold text-white tracking-tight ml-1">
          {title}
        </h1>

      </div>

      {/* right */}
      <div className="flex items-center gap-3">

        {user ? (
          <>
            {/* wallet badge */}
            <button
              onClick={() => navigate("/wallet")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-white/90 shadow-sm"
            >
              <Wallet size={16} className="text-teal-400" />
              ₹{balance}
            </button>

            {/* recharge */}
            <button
              onClick={() => navigate("/wallet?mode=recharge")}
              className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition"
            >
              Recharge
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition"
          >
            <LogIn size={16} />
            Login
          </Link>
        )}

      </div>
    </header>
  );
}

function pathTitle(pathname) {
  if (pathname.match(/^\/matches\/.+/)) return "Match Details";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/matches")) return "Arena";
  if (pathname.startsWith("/wallet")) return "Wallet";
  if (pathname.startsWith("/history")) return "Bet History";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/admin")) return "Admin";
  return "Arena";
}