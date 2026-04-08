import { useEffect, useState } from "react";
import MatchCard from "../components/cards/MatchCard.jsx";
import { useMatchStore } from "../store/matchStore.js";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import {
  RadioTower,
  CalendarDays,
  History,
  Search,
  Flame,
  Trophy,
  Crown,
   Medal, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from '../services/adminService.js';

const tabs = [
  { key: "live", label: "Live", icon: RadioTower },
  { key: "upcoming", label: "Upcoming", icon: CalendarDays },
  { key: "finished", label: "Finished", icon: History },
];

export default function MatchesPage() {
  const { matches, fetchMatches, loading } = useMatchStore();
  const [tab, setTab] = useState("live");
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [bannerImageLoading, setBannerImageLoading] = useState(true);
  useLiveUpdates();
  const SETTINGS_KEY = 'admin-panel-settings';
  const [banner, setBanner] = useState({ bannerEnabled: false, bannerText: '', bannerImageUrl: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getSettings();
        if (res && Object.keys(res).length) {
          setBannerImageLoading(true);
          setBanner({ bannerEnabled: !!res.bannerEnabled, bannerText: res.bannerText || '', bannerImageUrl: res.bannerImageUrl || '' });
          return;
        }
      } catch (err) {
        // fallback to localStorage
      }

      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setBannerImageLoading(true);
        setBanner({ bannerEnabled: !!parsed.bannerEnabled, bannerText: parsed.bannerText || '', bannerImageUrl: parsed.bannerImageUrl || '' });
      } catch (e) {
        // ignore
      }
    };

    load();

    const handler = (e) => {
      if (e.key !== SETTINGS_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || '{}');
        setBannerImageLoading(true);
        setBanner({ bannerEnabled: !!parsed.bannerEnabled, bannerText: parsed.bannerText || '', bannerImageUrl: parsed.bannerImageUrl || '' });
      } catch {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    fetchMatches(tab);
  }, [tab]);

  useEffect(() => {
    const names = [
      "Arjun",
      "Rohit",
      "Dev",
      "Priya",
      "Aman",
      "Ananya",
      "Vikram",
      "Maya",
    ];

    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Pune",
      "Ahmedabad",
    ];

    const generateUser = () => ({
      name: names[Math.floor(Math.random() * names.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      wins: Math.floor(Math.random() * 200) + 80,
    });

    setLeaderboard(Array.from({ length: 5 }, generateUser));

    const interval = setInterval(() => {
      setLeaderboard((prev) => {
        const newUser = generateUser();
        return [newUser, ...prev.slice(0, 4)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter(
    (m) =>
      m.teamA.toLowerCase().includes(search.toLowerCase()) ||
      m.teamB.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-   pb-10">
      {/* <style>{flowingAnimation}</style> */}
      {/* Search & Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or matches..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 shadow-sm transition-all text-sm font-medium"
          />
        </div>
      </div>
{console.log("banner",banner)}
      {banner.bannerEnabled && (banner.bannerText || banner.bannerImageUrl) ? (
        <div className="mt-4">
          <div className="py-3 rounded mb-3">
            {banner.bannerImageUrl ? (
              <div className="relative w-full bg-slate-100 rounded overflow-hidden" style={{ minHeight: '120px' }}>
                
                <img
                  src={banner.bannerImageUrl}
                  alt="site banner"
                  className="w-full h-auto object-contain rounded"
                  onLoad={() => setBannerImageLoading(false)}
                  onError={() => {
                    console.error('Banner image failed to load:', banner.bannerImageUrl);
                    setBannerImageLoading(false);
                  }}
                
                />
              </div>
            ) : (
              <p className="text-sm text-yellow-800">{banner.bannerText}</p>
            )}
          </div>
        </div>
      ) : null}
      {/* {!search && tab === "live" && filteredMatches.length > 0 && (
        <div className="relative overflow-hidden mt-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-5 text-white shadow-lg">
   
          <div className="absolute -top-10 -right-0 w-32 h-32 bg-red-500/30 blur-3xl rounded-full"></div>

     
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1 text-[11px] font-semibold bg-red-500/10 text-red-400 px-2 py-1 rounded-full uppercase tracking-wide">
              <Flame size={12} />
              Hot Event
            </span>
          </div>

     
          <h3 className="text-lg font-bold tracking-tight">
            {filteredMatches[0].teamA}
            <span className="text-slate-400 mx-1">vs</span>
            {filteredMatches[0].teamB}
          </h3>

    
          <p className="text-slate-400 text-sm mt-1">
            Top predictions paying up to
            <span className="text-yellow-400 font-semibold ml-1">
              2.5x
            </span>{" "}
            today
          </p>
        </div>
      )} */}

      {/* Segmented Control Tabs */}
      <div className="bg-white border border-slate-200 mt-4 rounded-2xl p-1 flex gap-1 shadow-sm w-full">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;

          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSearch("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all
        ${
          isActive
            ? "bg-indigo-600 text-white shadow-md"
            : "text-slate-500 hover:bg-slate-100"
        }`}
            >
              <Icon
                size={16}
                className={
                  isActive && t.key === "live"
                    ? "animate-pulse text-red-300"
                    : ""
                }
              />

              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-accent animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Loading arena...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {tab === "live"
                ? "Live Events"
                : tab === "upcoming"
                  ? "Scheduled Events"
                  : "Past Results"}
            </h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredMatches.length}
            </span>
          </div>

          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}

          {!filteredMatches.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No matches found
              </h3>
              <p className="text-slate-500 text-sm mt-1 px-8">
                {search
                  ? `We couldn't find any teams matching "${search}"`
                  : `There are no ${tab} matches available right now.`}
              </p>
            </div>
          )}

          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                Leaderboard
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Top Weekly
              </span>
            </div>

            <div className="overflow-hidden h-[350px]">
              <motion.div
                key={leaderboard[0]?.name}
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-3"
              >
{leaderboard.map((item, index) => (
  <div
    key={index}
    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 shadow-sm"
  >
    <div className="flex items-center gap-3">

      {/* Rank Icon */}
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-50">
        <Trophy className="text-yellow-500 w-5 h-5" />
      </div>

      {/* User Info */}
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          {item.name}
        </p>
        <p className="text-xs text-gray-400">{item.city}</p>
      </div>

    </div>

    {/* Wins */}
    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
      +{item.wins} Wins
    </span>
  </div>
))}
              </motion.div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
