import { useEffect, useState, Fragment } from 'react';
import { adminService } from '../../services/adminService.js';
import { format } from '../../utils/format.js';
import { useAuthStore } from '../../store/authStore.js';
import { Plus, Pencil, Trash2, Play, StopCircle, X, Upload, Image as ImageIcon } from 'lucide-react';
import PaginationControls from '../../components/admin/PaginationControls.jsx';

const STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-600',
  live: 'bg-red-100 text-red-600',
  finished: 'bg-slate-100 text-slate-500',
};
const PAGE_SIZE = 10;

const EMPTY_FORM = {
  teamA: '',
  teamB: '',
  teamALogo: '',
  teamBLogo: '',
  date: '',
  time: '',
  playingTeam: 'A',
  category: 'Cricket',
  status: 'upcoming'
};

const toDateInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInput = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploading, setUploading] = useState({ teamALogo: false, teamBLogo: false });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [templateOpenId, setTemplateOpenId] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    matchId: '',
    player1: '',
    player2: '',
    bowler1: '',
    bowler2: '',
    starBatsman: '',
    starBowler: ''
  });
  const [creatingTemplates, setCreatingTemplates] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getMatches({ status: filterStatus, page, limit: PAGE_SIZE })
      .then((data) => { setMatches(data.matches ?? []); setTotalPages(data.totalPages ?? 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, page]);

  const uploadImageToServer = async (file) => {
    const token = useAuthStore.getState().token;
    const fd = new FormData();
    fd.append('image', file);
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await response.json();
    if (!response.ok || !data?.url) {
      throw new Error(data?.error || 'Logo upload failed');
    }
    return data.url;
  };

  const handleLogoUpload = async (field, file) => {
    if (!file) return;
    setUploading((state) => ({ ...state, [field]: true }));
    try {
      const imageUrl = await uploadImageToServer(file);
      setForm((state) => ({ ...state, [field]: imageUrl }));
    } catch (error) {
      alert(error.message || 'Unable to upload logo');
    } finally {
      setUploading((state) => ({ ...state, [field]: false }));
    }
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal('edit'); };
  const openEdit = (m) => {
    setForm({
      teamA: m.teamA,
      teamB: m.teamB,
      teamALogo: m.teamALogo || '',
      teamBLogo: m.teamBLogo || '',
      date: toDateInput(m.matchTime),
      time: toTimeInput(m.matchTime),
      playingTeam: m.playingTeam || 'A',
      category: m.category || 'Cricket',
      status: m.status || 'upcoming',
      teamAScore: m.teamAScore || '',
      teamBScore: m.teamBScore || '',
      scoreTeam: 'A',
      scoreValue: m.teamAScore || ''
    });
    setEditId(m._id);
    setModal('edit');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this match?')) return;
    adminService.deleteMatch(id).then(load).catch(() => alert('Error deleting'));
  };

  const updateStatus = (id, status) => {
    adminService.updateMatch(id, { status }).then(load).catch(() => alert('Error'));
  };

  const handleSave = () => {
    setSaving(true);
    const p = editId
      ? adminService.updateMatch(editId, form)
      : adminService.addMatch(form);
    p.then(() => { setModal(null); load(); })
      .catch(() => alert('Error saving match'))
      .finally(() => setSaving(false));
  };

  const openTemplateForm = (m) => {
    setTemplateOpenId(m._id);
    setTemplateForm({
      matchId: m._id,
      player1: '',
      player2: '',
      bowler1: '',
      bowler2: '',
      starBatsman: '',
      starBowler: ''
    });
  };

  const handleCreateTemplatesSubmit = async (matchId) => {
    if (!matchId) return;
    setCreatingTemplates(true);
    try {
      const players = {
        player1: templateForm.player1,
        player2: templateForm.player2,
        bowler1: templateForm.bowler1,
        bowler2: templateForm.bowler2,
        starBatsman: templateForm.starBatsman,
        starBowler: templateForm.starBowler
      };
      await adminService.createTemplates(matchId, { players });
      alert('Templates created');
      setTemplateOpenId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to create templates');
    } finally {
      setCreatingTemplates(false);
    }
  };

  const filtered = matches;
  const totalPagesVal = totalPages;
  const paginated = matches;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {['all','upcoming','live','finished'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition ${filterStatus === s ? 'bg-accent text-white' : 'border border-slate-200 text-slate-500 hover:border-accent hover:text-accent'}`}>
            {s}
          </button>
        ))}
        <button onClick={openAdd} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:opacity-90 transition">
          <Plus size={14} /> Add Match
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Teams</th>
                  <th className="text-left px-4 py-3">Date/Time</th>
                  <th className="text-left px-4 py-3">Playing</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((m) => (
                  <Fragment key={m._id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{m.teamA} <span className="text-slate-400 font-normal">vs</span> {m.teamB}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{format.date(m.matchTime)}, {format.time(m.matchTime)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{m.playingTeam === 'A' ? m.teamA : m.playingTeam === 'B' ? m.teamB : (m.playingTeam || '—')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[m.status] || 'bg-slate-100 text-slate-400'}`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {m.status === 'upcoming' && (
                            <button onClick={() => updateStatus(m._id,'live')} title="Start Match" className="text-red-500 hover:text-red-700 transition"><Play size={15} /></button>
                          )}
                          {m.status === 'live' && (
                            <button onClick={() => updateStatus(m._id,'finished')} title="End Match" className="text-slate-500 hover:text-slate-800 transition"><StopCircle size={15} /></button>
                          )}
                          <button onClick={() => openTemplateForm(m)} title="Create Templates" className="text-emerald-500 hover:text-emerald-700 transition text-sm font-semibold px-2 py-1 rounded">Templates</button>
                          <button onClick={() => openEdit(m)} className="text-indigo-500 hover:text-indigo-700 transition"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(m._id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>

                    {templateOpenId === m._id && (
                      <tr className="bg-slate-50">
                        <td colSpan="5" className="px-4 py-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Player 1</label>
                              <input type="text" value={templateForm.player1} onChange={e => setTemplateForm(f => ({ ...f, player1: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Player 2</label>
                              <input type="text" value={templateForm.player2} onChange={e => setTemplateForm(f => ({ ...f, player2: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Bowler 1</label>
                              <input type="text" value={templateForm.bowler1} onChange={e => setTemplateForm(f => ({ ...f, bowler1: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Bowler 2</label>
                              <input type="text" value={templateForm.bowler2} onChange={e => setTemplateForm(f => ({ ...f, bowler2: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Star Batsman</label>
                              <input type="text" value={templateForm.starBatsman} onChange={e => setTemplateForm(f => ({ ...f, starBatsman: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Star Bowler</label>
                              <input type="text" value={templateForm.starBowler} onChange={e => setTemplateForm(f => ({ ...f, starBowler: e.target.value }))} className="w-full border text-black border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <button onClick={() => setTemplateOpenId(null)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-black font-bold">Cancel</button>
                            <button onClick={() => handleCreateTemplatesSubmit(m._id)} disabled={creatingTemplates} className="px-3 py-2 rounded-xl bg-accent  font-bold">{creatingTemplates ? 'Creating...' : 'Create Templates'}</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {!matches.length && <div className="text-center py-12 text-slate-400 text-sm">No matches found</div>}
          </div>
          <PaginationControls page={page} totalPages={totalPagesVal} onPageChange={setPage} />
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4 sm:my-0 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 sm:px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">{editId ? 'Edit Match' : 'Add Match'}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"><X size={20} /></button>

              {/* Instant Score Update for Live Matches */}
              {form.status === 'live' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Score Update (Team-wise)</label>
                  <div className="flex gap-2 items-center mb-2">
                    <select
                      value={form.scoreTeam || 'A'}
                      onChange={e => setForm(f => {
                        const team = e.target.value;
                        const score = team === 'A' ? (f.teamAScore || '') : (f.teamBScore || '');
                        return { ...f, scoreTeam: team, scoreValue: score };
                      })}
                      className="border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent"
                    >
                      <option value="A">{form.teamA || 'Team A'}</option>
                      <option value="B">{form.teamB || 'Team B'}</option>
                    </select>
                    <input
                      type="text"
                      value={form.scoreValue || ''}
                      onChange={e => setForm(f => ({ ...f, scoreValue: e.target.value }))}
                      placeholder="e.g. 120/3 (15.2)"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      disabled={!form.scoreValue || !editId}
                      onClick={async () => {
                        if (!form.scoreValue || !editId) return;
                        try {
                          const updated = await adminService.updateScore({ matchId: editId, team: form.scoreTeam || 'A', score: form.scoreValue });
                          setForm(f => ({
                            ...f,
                            teamAScore: updated.teamAScore || f.teamAScore || '',
                            teamBScore: updated.teamBScore || f.teamBScore || '',
                            scoreValue: (f.scoreTeam === 'A' ? (updated.teamAScore || '') : (updated.teamBScore || ''))
                          }));
                          load();
                          alert('Score updated!');
                        } catch (e) {
                          alert('Score update failed');
                        }
                      }}
                    >Update Score</button>
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-4 sm:px-5 py-4 space-y-3 overflow-y-auto max-h-[65vh] sm:max-h-[70vh]">

              {/* Team names — side by side */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Team A', key: 'teamA' },
                  { label: 'Team B', key: 'teamB' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                    <input type="text" value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                      placeholder={label}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent" />
                  </div>
                ))}
              </div>

              {/* Date + Time — side by side */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Time', key: 'time', type: 'time' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent" />
                  </div>
                ))}
              </div>

              {/* Playing Team + Category — side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Playing Team</label>
                  <select value={form.playingTeam} onChange={e => setForm(f => ({...f, playingTeam: e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent">
                    <option value={form.teamA}>{form.teamA || 'Team A'}</option>
                    <option value={form.teamB}>{form.teamB || 'Team B'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <input type="text" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                    placeholder="Category"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent" />
                </div>
              </div>

              {/* Logo uploads — Team A & B */}
              {[
                { field: 'teamALogo', label: 'Team A Logo' },
                { field: 'teamBLogo', label: 'Team B Logo' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent cursor-pointer transition">
                      <Upload size={13} />
                      {uploading[field] ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading[field]}
                        onChange={(e) => handleLogoUpload(field, e.target.files?.[0])}
                      />
                    </label>
                    {form[field] ? (
                      <img src={form[field]} alt={field} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                        <ImageIcon size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent">
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading.teamALogo || uploading.teamBLogo} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                {saving ? 'Saving…' : uploading.teamALogo || uploading.teamBLogo ? 'Uploading Logo…' : 'Save'}
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
