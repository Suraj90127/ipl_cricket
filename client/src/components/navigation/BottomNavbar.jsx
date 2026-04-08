import { NavLink } from "react-router-dom";
import { Home, BarChart3, Wallet, ReceiptText, User } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/dashboard", label: "Insights", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/history", label: "History", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNavbar() {
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4">

      <nav className="flex justify-between items-center w-full max-w-md px-2 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all
                ${
                  isActive
                    ? "text-teal-400"
                    : "text-white/40 hover:text-white/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-lg transition
                    ${
                      isActive
                        ? "bg-teal-400/10 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                        : ""
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.3} />
                  </div>

                  <span
                    className={`text-[10px] font-bold tracking-wide ${
                      isActive ? "text-teal-400" : ""
                    }`}
                  >
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}