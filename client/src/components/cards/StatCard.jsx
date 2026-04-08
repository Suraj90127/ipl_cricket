export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 border flex items-center gap-3 transition
      ${
        accent
          ? "bg-indigo-600 border-indigo-500 text-white"
          : "bg-white border-gray-100 text-gray-800 shadow-sm hover:shadow-md"
      }`}
    >
      {/* icon */}
      {icon && (
        <div
          className={`p-2 rounded-lg ${
            accent ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
        </div>
      )}

      {/* content */}
      <div className="flex flex-col">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            accent ? "text-indigo-200" : "text-gray-400"
          }`}
        >
          {label}
        </span>

        <span className="text-xl font-bold leading-tight">
          {value}
        </span>
      </div>

      {/* accent glow */}
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
}