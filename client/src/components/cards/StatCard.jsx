export default function StatCard({ label, value, icon, variant = "default" }) {
  const variants = {
    default: "text-teal-400 bg-white/10",
    success: "text-emerald-400 bg-emerald-500/10",
    danger: "text-red-400 bg-red-500/10",
    warning: "text-amber-400 bg-amber-500/10",
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 flex items-center gap-3 shadow-lg group hover:bg-white/10 transition-all duration-300"
    >
      {/* icon */}
      {icon && (
        <div className={`p-2.5 rounded-xl border border-white/5 transition-transform group-hover:scale-110 ${variants[variant] || variants.default}`}>
          {icon}
        </div>
      )}

      {/* content */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          {label}
        </span>

        <span className="text-lg font-bold text-white tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
}