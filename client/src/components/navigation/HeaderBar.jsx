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
    <header className="sticky top-0 z-50 w-full max-w-md mx-auto bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">

      {/* left */}
      <div className="flex items-center ">

        {showBack && (
          <Link
            to=".."
            relative="path"
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </Link>
        )}

        <h1 className="text-base font-semibold text-slate-800">
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
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700"
            >
              <Wallet size={16} />
              ₹{balance}
            </button>

            {/* recharge */}
            <button
              onClick={() => navigate("/wallet?mode=recharge")}
              className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Recharge
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
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