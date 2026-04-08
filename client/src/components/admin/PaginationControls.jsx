import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-white">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Prev
      </button>
      <span className="text-xs font-bold text-slate-500">Page {page} / {totalPages}</span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}
