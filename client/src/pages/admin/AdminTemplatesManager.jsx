import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';

export default function AdminTemplatesManager() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState('');
  const [status, setStatus] = useState('open');
  const [autoCloseAt, setAutoCloseAt] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all'); // 'all' | 'template' | 'non-template'
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const formatSeconds = (s) => {
    if (typeof s !== 'number' || s === null) return 'no timer';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m > 0 && sec === 0) return `${m}m`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    adminService.getAllMatches().then((m) => setMatches(m)).catch(() => {});
  }, []);

  const loadQuestions = async (matchId) => {
    if (!matchId) return;
    setLoading(true);
    try {
      const data = await adminService.getQuestions({ matchId,limit: 100});
      setQuestions(data.questions ?? data);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (err) {
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMatch) loadQuestions(selectedMatch);
  }, [selectedMatch]);

  const displayedQuestions = questions.filter((q) => {
    if (templateFilter === 'all') return true;
    const isTemplate = q.autoLockBeforeMinutes !== null && typeof q.autoLockBeforeMinutes !== 'undefined';
    const isSystem = q.isSystemQuestion === true;
    if (templateFilter === 'template') return isTemplate;
    // non-template: exclude template questions and system questions (like toss/match-winner)
    return !isTemplate && !isSystem;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      setSelectAll(s.size === displayedQuestions.length);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const all = new Set(displayedQuestions.map((q) => q._id));
      setSelectedIds(all);
      setSelectAll(true);
    }
  };

  const applyUpdates = async (applyAll = false) => {
    if (!selectedMatch) return alert('Select a match first');
    const updates = {};
    if (timerSeconds !== '') updates.timerSeconds = Number(timerSeconds)*60;
    if (status) updates.status = status;
    if (autoCloseAt) updates.autoCloseAt = new Date(autoCloseAt).toISOString();
    if (Object.keys(updates).length === 0) return alert('Specify updates to apply');

    // If applying to all but a filter is active, apply only to displayed (filtered) questions
    let questionIds;
    if (applyAll) {
      questionIds = templateFilter === 'all' ? undefined : displayedQuestions.map((q) => q._id);
    } else {
      questionIds = Array.from(selectedIds);
    }
    setApplying(true);
    try {
      const payload = { matchId: selectedMatch, questionIds, updates };
      const res = await adminService.bulkUpdateQuestions(payload);
      alert(`Updated ${res.updatedCount} questions`);
      await loadQuestions(selectedMatch);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to apply updates');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Templates Manager</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Match</label>
          <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} className="w-full border border-slate-200 text-black rounded-xl px-3 py-2">
            <option value="">-- Select match --</option>
            {matches.map((m) => (
              <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB} - {new Date(m.matchTime).toLocaleString()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Timer (minutes)</label>
          <input type="number" value={timerSeconds} onChange={(e) => setTimerSeconds(e.target.value)} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2" placeholder="e.g. 2" />
          <p className="text-xs text-slate-400 mt-1">Enter minutes — will be converted to seconds when applied.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Auto-Close At</label>
          <input type="datetime-local" value={autoCloseAt} onChange={(e) => setAutoCloseAt(e.target.value)} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2" />
          <p className="text-xs text-slate-400 mt-1">Questions will auto-close at this time.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2">
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Question Type</label>
          <select value={templateFilter} onChange={(e) => { setTemplateFilter(e.target.value); setSelectedIds(new Set()); setSelectAll(false); }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-black">
            <option value="all">All</option>
            <option value="template">Template Questions</option>
            <option value="non-template">Without Template</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => applyUpdates(false)} disabled={applying} className="px-4 py-2 bg-accent text-black rounded-xl">Apply to Selected</button>
        <button onClick={() => applyUpdates(true)} disabled={applying} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Apply to All</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-black">
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
            <span className="font-semibold">Questions ({displayedQuestions.length})</span>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="text-center py-8">Loading…</div>
          ) : (
            <div className="space-y-2">
              {displayedQuestions.map((q) => (
                <div key={q._id} className="flex items-center justify-between p-2 border border-slate-50 rounded">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedIds.has(q._id)} onChange={() => toggleSelect(q._id)} />
                    <div>
                      <div className="font-semibold text-black">{q.question}</div>
                      <div className="text-xs text-slate-500">
                        {q.categoryName} • {q.status} • 
                        {q.autoCloseAt ? (
                          <>Auto-closes: {new Date(q.autoCloseAt).toLocaleString()}</>
                        ) : (
                          <>
                            {typeof q.timerSeconds === 'number' ? formatSeconds(q.timerSeconds) : (q.autoLockBeforeMinutes ? `Auto-lock in ${q.autoLockBeforeMinutes}m` : 'no timer')}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-black">{q.options.map(o => o.label).join(' / ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
