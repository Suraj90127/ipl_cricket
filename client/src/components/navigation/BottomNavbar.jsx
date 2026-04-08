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
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">

      <nav className="flex justify-between items-center w-full max-w-md px-2 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg">

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all
                ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 hover:text-slate-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-lg transition
                    ${
                      isActive
                        ? "bg-indigo-100 text-indigo-600"
                        : ""
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.3} />
                  </div>

                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? "text-indigo-600" : ""
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