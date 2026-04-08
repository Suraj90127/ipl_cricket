import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import { Plus, Pencil, X, ToggleLeft, ToggleRight } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const CATEGORIES = ['Match Winner', 'Overs', 'Run', 'Player', 'Wicket', 'Toss', 'Other'];
const EMPTY_FORM = { matchId: '', question: '', options: [{ label: '', odds: '' }, { label: '', odds: '' }], category: 'Other', status: 'open', timerSeconds: '' };
const PAGE_SIZE = 10;

const getOptionLabel = (option) => {
  if (typeof option === 'string') return option;
  return option?.label || '';
};
const getOptionOdds = (option) => {
  if (typeof option === 'object' && option?.odds !== undefined) return option.odds;
  return '';
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterMatch, setFilterMatch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([adminService.getQuestions({ matchId: filterMatch, page, limit: PAGE_SIZE }), adminService.getAllMatches()])
      .then(([qData, m]) => { setQuestions(qData.questions ?? []); setTotalPages(qData.totalPages ?? 1); setMatches(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterMatch, page]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true); };
  const openEdit = (q) => {
    setForm({
      matchId: q.matchId?._id || q.matchId || '',
      question: q.question,
      options: (q.options || [{ label: '', odds: '' }, { label: '', odds: '' }]).map(opt => ({
        label: getOptionLabel(opt),
        odds: getOptionOdds(opt)
      })),
      category: q.categoryName || q.category || 'Other',
      status: q.status || 'open',
      timerSeconds: q.timerSeconds || ''
    });
    setEditId(q._id);
    setModal(true);
  };

  const toggleStatus = (q) => {
    const next = q.status === 'open' ? 'closed' : 'open';
    adminService.updateQuestion(q._id, { status: next }).then(load).catch(() => alert('Error'));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      question: form.question.trim(),
      category: form.category,
      options: form.options
        .map((option) => ({
          label: (option.label || '').trim(),
          odds: option.odds !== '' ? Number(option.odds) : undefined
        }))
        .filter((option) => option.label),
      timerSeconds: form.timerSeconds !== '' ? Number(form.timerSeconds) : undefined
    };

    if (!payload.matchId || !payload.question || payload.options.length < 2) {
      alert('Match, question aur kam se kam 2 options required hain');
      return;
    }

    setSaving(true);
    const p = editId
      ? adminService.updateQuestion(editId, payload)
      : adminService.addQuestion(payload);
    p.then(() => { setModal(false); load(); })
      .catch(() => alert('Error saving question'))
      .finally(() => setSaving(false));
  };

  const setOption = (i, key, val) => setForm(f => {
    const options = [...f.options];
    options[i] = { ...options[i], [key]: val };
    return { ...f, options };
  });
  const addOption = () => setForm(f => ({ ...f, options: [...f.options, { label: '', odds: '' }] }));
  const removeOption = (i) => setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

  const filtered = questions;
  const totalPagesVal = totalPages;
  const paginated = questions;

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    adminService.deleteQuestion(id).then(load).catch(() => alert('Error deleting question'));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={filterMatch} onChange={e => { setFilterMatch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-accent">
          <option value="">All Matches</option>
          {matches.map(m => <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB}</option>)}
        </select>
        <button onClick={openAdd} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:opacity-90">
          <Plus size={14} /> Add Question
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Match</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Options</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Created</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800 max-w-[200px] truncate font-medium">{q.question}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {q.matchId ? `${q.matchId.teamA} vs ${q.matchId.teamB}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600">{q.categoryName || q.category || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {(q.options || []).map(opt => {
                        const label = getOptionLabel(opt);
                        const odds = getOptionOdds(opt);
                        return odds ? `${label} (odds: ${odds})` : label;
                      }).filter(Boolean).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleStatus(q)} title="Toggle status" className="transition">
                        {q.status === 'open'
                          ? <ToggleRight size={22} className="text-green-500" />
                          : <ToggleLeft size={22} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs whitespace-nowrap">{format.date(q.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(q)} className="text-indigo-500 hover:text-indigo-700 transition"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(q._id)} className="text-red-500 hover:text-red-700 transition"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!questions.length && <div className="text-center py-12 text-slate-400 text-sm">No questions found</div>}
          </div>
          <PaginationControls page={page} totalPages={totalPagesVal} onPageChange={setPage} />
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">{editId ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Match</label>
                <select value={form.matchId} onChange={e => setForm(f => ({...f, matchId: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent">
                  <option value="">Select match</option>
                  {matches.map(m => <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Question</label>
                <input value={form.question} onChange={e => setForm(f => ({...f, question: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500">Options</label>
                  <button onClick={addOption} className="text-xs text-accent font-bold">+ Add Option</button>
                </div>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={opt.label}
                      onChange={e => setOption(i, 'label', e.target.value)}
                      placeholder={`Option ${i+1}`}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      value={opt.odds}
                      onChange={e => setOption(i, 'odds', e.target.value)}
                      placeholder="Odds"
                      className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent"
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Timer (minutes)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.timerSeconds !== '' ? (form.timerSeconds / 60) : ''}
                  onChange={e => {
                    const min = parseFloat(e.target.value);
                    setForm(f => ({ ...f, timerSeconds: !isNaN(min) && min > 0 ? Math.round(min * 60) : '' }));
                  }}
                  placeholder="e.g. 2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent"
                />
                <span className="text-xs text-slate-400">(Timer will run as mm:ss)</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
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
