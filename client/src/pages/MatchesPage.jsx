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
  Medal,
  Award
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
      } catch (err) {}

      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setBannerImageLoading(true);
        setBanner({ bannerEnabled: !!parsed.bannerEnabled, bannerText: parsed.bannerText || '', bannerImageUrl: parsed.bannerImageUrl || '' });
      } catch (e) {}
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
    const names = ["Arjun","Rohit","Dev","Priya","Aman","Ananya","Vikram","Maya"];
    const cities = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad"];

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
    <div className="min-h-screen pb-10 px-4 
    bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f] relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>

      {/* Search */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/20 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-white/40" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or matches..."
            className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
        </div>
      </div>

      {banner.bannerEnabled && (banner.bannerText || banner.bannerImageUrl) ? (
        <div className="mt-4">
          <div className="py-3 rounded mb-3">
            {banner.bannerImageUrl ? (
              <div className="relative w-full bg-white/5 border border-white/10 rounded overflow-hidden backdrop-blur-xl" style={{ minHeight: '120px' }}>
                <img
                  src={banner.bannerImageUrl}
                  alt="site banner"
                  className="w-full h-auto object-contain rounded"
                  onLoad={() => setBannerImageLoading(false)}
                  onError={() => setBannerImageLoading(false)}
                />
              </div>
            ) : (
              <p className="text-sm text-yellow-400">{banner.bannerText}</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="bg-white/5 border border-white/10 mt-4 rounded-2xl p-1 flex gap-1 backdrop-blur-xl">
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
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition
              ${
                isActive
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow"
                  : "text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon size={16} className={isActive && t.key === "live" ? "animate-pulse text-red-400" : ""} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-teal-400 animate-spin mb-4"></div>
          <p className="text-white/50 font-medium">Loading arena...</p>
        </div>
      ) : (
        <div className="space-y-4">

          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-semibold text-white/90">
              {tab === "live" ? "Live Events" : tab === "upcoming" ? "Scheduled Events" : "Past Results"}
            </h2>
            <span className="text-xs font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
              {filteredMatches.length}
            </span>
          </div>

          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}

          {!filteredMatches.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white/30">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">No matches found</h3>
              <p className="text-white/50 text-sm mt-1 px-8">
                {search ? `We couldn't find any teams matching "${search}"` : `There are no ${tab} matches available right now.`}
              </p>
            </div>
          )}

          {/* Leaderboard */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                Leaderboard
              </h2>
              <span className="text-[10px] text-white/60 bg-white/10 px-2 py-1 rounded">
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
                    className="flex items-center justify-between p-3 rounded-2xl 
                    bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:scale-[1.02] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-500/20">
                        <Trophy className="text-yellow-400 w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-white/50">{item.city}</p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
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