import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { Trophy } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const PAGE_SIZE = 8;

const normalizeOption = (option) => {
  if (typeof option === 'string') return { value: option, label: option };
  if (option && typeof option === 'object') {
    const label = option.label ?? option.value ?? String(option.odds ?? 'Option');
    return { value: String(label), label: String(label) };
  }
  const fallback = String(option ?? 'Option');
  return { value: fallback, label: fallback };
};

export default function AdminResults() {
  const [questions, setQuestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { [questionId]: winningOption }
  const [pushing, setPushing] = useState({});
  const [done, setDone] = useState({});
  const [filterMatch, setFilterMatch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all'); // all | template | non-template
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    const params = { matchId: filterMatch, page, limit: PAGE_SIZE };
    if (templateFilter && templateFilter !== 'all') params.templateFilter = templateFilter === 'template' ? 'template' : 'non-template';
    Promise.all([adminService.getQuestions(params), adminService.getAllMatches()])
      .then(([qData, m]) => {
        setQuestions(qData.questions ?? []);
        setTotalPages(qData.totalPages ?? 1);
        setMatches(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterMatch, page, templateFilter]);

  const handlePush = (q) => {
    const winningOption = selected[q._id];
    if (!winningOption) return alert('Select a winning option first');
    setPushing(p => ({ ...p, [q._id]: true }));
    adminService.pushResult({ questionId: q._id, winningOption })
      .then(() => { setDone(d => ({ ...d, [q._id]: true })); load(); })
      .catch(() => alert('Error pushing result'))
      .finally(() => setPushing(p => ({ ...p, [q._id]: false })));
  };

  const filtered = questions;
  const totalPagesVal = totalPages;
  const paginated = questions;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={filterMatch} onChange={e => { setFilterMatch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-accent">
          <option value="">All Matches</option>
          {matches.map(m => <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB}</option>)}
        </select>

        <select value={templateFilter} onChange={e => { setTemplateFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-accent">
          <option value="all">All Questions</option>
          <option value="template">Template Questions</option>
          <option value="non-template">Without Template</option>
        </select>

        <span className="text-xs text-slate-400 ml-2">{filtered.length} questions</span>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {paginated.map((q) => (
            <div key={q._id} className={`bg-white border rounded-2xl p-4 shadow-sm transition ${done[q._id] ? 'opacity-60 border-green-200' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{q.question}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {q.matchId ? `${q.matchId.teamA} vs ${q.matchId.teamB}` : ''} · <span className="capitalize">{q.category}</span>
                  </p>
                </div>
                {done[q._id] && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Trophy size={11} /> Result Pushed
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(q.options || []).map((opt, idx) => {
                  const option = normalizeOption(opt);
                  return (
                  <button key={`${q._id}-${option.value}-${idx}`} onClick={() => setSelected(s => ({ ...s, [q._id]: option.value }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${selected[q._id] === option.value ? 'bg-accent text-white border-accent' : 'border-slate-200 text-slate-600 hover:border-accent'}`}>
                    {option.label}
                  </button>
                );})}
              </div>
              <button onClick={() => handlePush(q)} disabled={pushing[q._id] || done[q._id] || !selected[q._id]}
                className="w-full py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-40 transition flex items-center justify-center gap-2">
                <Trophy size={13} />
                {pushing[q._id] ? 'Pushing…' : done[q._id] ? 'Pushed' : 'Push Result & Award Winners'}
              </button>
            </div>
          ))}
          {!questions.length && <div className="text-center py-12 text-slate-400 text-sm">No pending questions to resolve</div>}
          <PaginationControls page={page} totalPages={totalPagesVal} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);
