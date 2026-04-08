import { useEffect, useState } from 'react';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { adminService } from '../../services/adminService.js';
import { RefreshCw } from 'lucide-react';

export default function AdminLiveQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [scoreInputs, setScoreInputs] = useState({});
  const [updatingScores, setUpdatingScores] = useState({});
  const socket = useSocket();

  const load = () => {
    setLoading(true);
    const params = {};
    if (selectedMatch) params.matchId = selectedMatch;
    if (templateFilter && templateFilter !== 'all') params.templateFilter = templateFilter;
    adminService.getLiveQuestions(params)
      .then((data) => {
        const list = data.questions ?? [];
        const filtered = list.filter((q) => {
          const totalFromCounts = Object.values(q.counts || {}).reduce((s, v) => s + (Number(v) || 0), 0);
          const total = Number(q.totalBets ?? totalFromCounts ?? 0);
          return total > 0;
        });
        setQuestions(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedMatch, templateFilter]);

  useEffect(() => {
    adminService.getAllMatches().then((m) => {
      try { setMatches((m || []).filter((x) => x.status === 'live' || !x.status)); } catch { setMatches(m || []); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onBetNew = () => { load(); };
    const onQuestionUpdate = (q) => {
      setQuestions((prev) => {
        const totalFromCounts = Object.values(q.counts || {}).reduce((s, v) => s + (Number(v) || 0), 0);
        const total = Number(q.totalBets ?? totalFromCounts ?? 0);
        const idx = prev.findIndex((p) => String(p._id) === String(q._id));
        if (total <= 0) {
          if (idx === -1) return prev;
          return prev.filter((p) => String(p._id) !== String(q._id));
        }
        if (idx === -1) return [q, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...q };
        return copy;
      });
    };
    const onQuestionResult = ({ questionId }) => {
      setQuestions((prev) => prev.filter((p) => String(p._id) !== String(questionId)));
    };

    socket.on('bet:new', onBetNew);
    socket.on('question:update', onQuestionUpdate);
    socket.on('question:result', onQuestionResult);
    return () => {
      socket.off('bet:new', onBetNew);
      socket.off('question:update', onQuestionUpdate);
      socket.off('question:result', onQuestionResult);
    };
  }, [socket, selectedMatch, templateFilter]);

  const submitResult = async (questionId, optionLabel) => {
    if (!confirm(`Set "${optionLabel}" as winning option? This will settle bets.`)) return;
    try {
      await adminService.pushResult({ questionId, winningOption: optionLabel });
      setQuestions((prev) => prev.filter((p) => String(p._id) !== String(questionId)));
    } catch (err) {
      console.error(err);
      alert('Failed to submit result');
    }
  };

  const updateMatchScore = async (matchId, team) => {
    const score = scoreInputs[`${matchId}-${team}`];
    if (score === undefined || score === '') {
      alert(`Please enter score for Team ${team}`);
      return;
    }
    
    setUpdatingScores((prev) => ({ ...prev, [`${matchId}-${team}`]: true }));
    try {
      await adminService.updateScore({ matchId, team, score });
      // Update matches state
      setMatches((prev) => prev.map((m) => {
        if (String(m._id) === String(matchId)) {
          if (team === 'A') return { ...m, teamAScore: score };
          if (team === 'B') return { ...m, teamBScore: score };
        }
        return m;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update score');
    } finally {
      setUpdatingScores((prev) => ({ ...prev, [`${matchId}-${team}`]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-bold text-slate-700">{questions.length} Live Questions</span>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-accent hover:text-accent transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Match</label>
          <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} className="w-full border border-slate-200 text-black rounded-xl px-3 py-2">
            <option value="">All matches</option>
            {matches.map((m) => (
              <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB}{m.matchTime ? ` - ${new Date(m.matchTime).toLocaleString()}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Template</label>
          <select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} className="w-full border border-slate-200 text-black rounded-xl px-3 py-2">
            <option value="all">All</option>
            <option value="template">With Template</option>
            <option value="non-template">Without Template</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-accent hover:text-accent transition">Apply</button>
          <button onClick={() => { setSelectedMatch(''); setTemplateFilter('all'); }} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-accent hover:text-accent transition">Reset</button>
        </div>
      </div>

      {/* Live Match Score Updates */}
      {matches.length > 0 && (
        <div className="bg-white text-black rounded-2xl border border-slate-100 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            Live Match Scores
          </h3>
          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match._id} className="grid grid-cols-5 gap-2 items-center p-3 bg-slate-50 rounded-lg">
                <div className="col-span-1">
                  <span className="text-xs font-bold text-slate-600">{match.teamA}</span>
                  <div className="text-lg font-bold text-accent">{match.teamAScore || '-'}</div>
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    placeholder="Score"
                    value={scoreInputs[`${match._id}-A`] !== undefined ? scoreInputs[`${match._id}-A`] : (match.teamAScore || '')}
                    onChange={(e) => setScoreInputs((prev) => ({ ...prev, [`${match._id}-A`]: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-center"
                  />
                  <button
                    onClick={() => updateMatchScore(match._id, 'A')}
                    disabled={updatingScores[`${match._id}-A`]}
                    className="w-full mt-1 text-xs px-2 py-1 rounded bg-accent text-white disabled:opacity-50"
                  >
                    {updatingScores[`${match._id}-A`] ? 'Updating...' : 'Update'}
                  </button>
                </div>
                <div className="col-span-1 text-center">
                  <div className="text-xs font-bold text-slate-500">vs</div>
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    placeholder="Score"
                    value={scoreInputs[`${match._id}-B`] !== undefined ? scoreInputs[`${match._id}-B`] : (match.teamBScore || '')}
                    onChange={(e) => setScoreInputs((prev) => ({ ...prev, [`${match._id}-B`]: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-center"
                  />
                  <button
                    onClick={() => updateMatchScore(match._id, 'B')}
                    disabled={updatingScores[`${match._id}-B`]}
                    className="w-full mt-1 text-xs px-2 py-1 rounded bg-accent text-white disabled:opacity-50"
                  >
                    {updatingScores[`${match._id}-B`] ? 'Updating...' : 'Update'}
                  </button>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-bold text-slate-600">{match.teamB}</span>
                  <div className="text-lg font-bold text-accent">{match.teamBScore || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? <div className="py-10 text-center">Loading…</div> : (
        <div className="bg-white text-black rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Match</th>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Total Bets</th>
                  <th className="text-left px-4 py-3">Options (count)</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id} className="border-t last:border-b">
                    <td className="px-4 py-3">{q.matchId?.teamA} vs {q.matchId?.teamB}</td>
                    <td className="px-4 py-3 max-w-[380px] break-words">{q.question}</td>
                    <td className="px-4 py-3">{q.totalBets ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {(q.options || []).map((opt) => (
                          <div key={opt.label} className="flex items-center justify-between gap-3">
                            <div className="text-sm text-slate-700">
                              {opt.label} <span className="text-xs text-slate-400">{opt.odds ? `(${opt.odds})` : ''}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-bold">{q.counts?.[opt.label] ?? 0}</div>
                              <div className="text-xs text-slate-400">₹{Number(q.amounts?.[opt.label] ?? 0).toFixed(2)}</div>
                              <button onClick={() => submitResult(q._id, opt.label)} className="text-xs px-2 py-1 rounded-lg bg-accent text-white">Set Result</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!questions.length && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 opacity-60 bg-white/50 rounded-2xl border border-slate-100 border-dashed">No live questions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
