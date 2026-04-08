import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Info, Bell, Copy, CheckCircle2, LogOut, RefreshCw, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { adminService } from '../../services/adminService.js';

const SETTINGS_KEY = 'admin-panel-settings';

export default function AdminSettings() {
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    soundAlerts: false,
    compactTables: false,
    autoRefreshLiveData: true,
    darkModePreview: false,
    bannerEnabled: false,
    bannerText: '',
    bannerImageUrl: ''
  });

  const backendUrl = useMemo(
    () => `${window.location.protocol}//${window.location.hostname}:5000`,
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getSettings();
        if (res && Object.keys(res).length) {
          setPreferences((state) => ({ ...state, ...res }));
          return;
        }
      } catch (err) {
        // fallback to localStorage
      }

      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setPreferences((state) => ({ ...state, ...parsed }));
      } catch {
        // ignore invalid persisted settings
      }
    };

    load();
  }, []);

  const updatePreference = (key) => {
    setPreferences((state) => {
      const next = { ...state, [key]: !state[key] };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      setSaved(true);
      return next;
    });
    setTimeout(() => setSaved(false), 1200);
  };

  const updateBannerEnabled = () => {
    const nextEnabled = !preferences.bannerEnabled;
    const next = { ...preferences, bannerEnabled: nextEnabled };
    setPreferences(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    adminService.saveSettings({ bannerEnabled: nextEnabled }).catch(() => {
      setUploadError('Failed to save banner setting');
    });
  };

  const updateBannerText = (text) => {
    const next = { ...preferences, bannerText: text };
    setPreferences(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    adminService.saveSettings({ bannerText: text }).catch(() => {
      setUploadError('Failed to save banner text');
    });
  };

  const updateBannerImageUrl = (url) => {
    setPreferences((state) => {
      const next = { ...state, bannerImageUrl: String(url || '') };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      return next;
    });
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setUploadError('');
  };

  const uploadSelectedFile = async () => {
    if (!selectedFile) return alert('Select an image first');
    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('image', selectedFile);
      const res = await adminService.uploadImage(form);
      // server returns { url }
      const url = res?.url ?? res?.data ?? null;
      if (!url) throw new Error('Upload failed');
      const next = { ...preferences, bannerImageUrl: url };
      setPreferences(next);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      // persist to server
      await adminService.saveSettings({ bannerImageUrl: url });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err) {
      setUploadError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeBannerImage = () => {
    const next = { ...preferences, bannerImageUrl: '' };
    setPreferences(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    adminService.saveSettings({ bannerImageUrl: '' }).catch(() => setUploadError('Failed to remove banner image'));
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const copyBackendUrl = async () => {
    try {
      await navigator.clipboard.writeText(backendUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert('Could not copy URL');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Shield size={15} className="text-accent" /> Admin Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Name', value: user?.name || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Phone', value: user?.phone || '—' },
            { label: 'Role', value: user?.role || 'admin' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm">
              <p className="text-slate-500 font-medium">{label}</p>
              <p className="text-slate-800 font-bold capitalize mt-0.5 break-all">{value}</p>
            </div>
          ))}
        </div>
      </div>

        {/* Admin Banner */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Bell size={15} className="text-accent" /> Admin Banner
            </h3>
            {saved && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold">Show Banner</label>
              <button onClick={updateBannerEnabled} className={`relative h-6 w-11 rounded-full transition ${preferences.bannerEnabled ? 'bg-accent' : 'bg-slate-200'}`} aria-label="Banner enabled">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${preferences.bannerEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            <textarea value={preferences.bannerText} onChange={(e) => updateBannerText(e.target.value)} placeholder="Enter banner text to show across admin pages" rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800" />

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Upload Banner Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm" />
              <div className="flex gap-2 mt-2">
                <button onClick={uploadSelectedFile} disabled={!selectedFile || uploading} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload'}</button>
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(''); setUploadError(''); }} className="px-3 py-2 rounded-xl border text-sm">Clear</button>
              </div>
              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </div>

            {previewUrl && (
              <div className="mt-2">
                <p className="text-xs font-semibold mb-1">Preview</p>
                <img src={previewUrl} alt="preview" className="w-full max-h-40 object-contain rounded" />
              </div>
            )}

            {preferences.bannerImageUrl && !previewUrl && (
              <div className="mt-2">
                <p className="text-xs font-semibold mb-1">Current Banner Image</p>
                <div className="flex items-center gap-3">
                  <img src={preferences.bannerImageUrl} alt="banner" className="w-48 max-h-24 object-contain rounded" />
                  <button onClick={removeBannerImage} className="px-3 py-2 rounded-xl border text-sm">Remove</button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400">When enabled, the banner (text or image) will appear at the top of admin pages.</p>
          </div>
        </div>

      {/* Admin Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Bell size={15} className="text-accent" /> Admin Preferences
          </h3>
          {saved && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Saved
            </span>
          )}
        </div>
        <div className="space-y-3">
          <PreferenceRow
            label="Email alerts"
            description="Get email on recharge/withdraw requests"
            value={preferences.emailAlerts}
            onChange={() => updatePreference('emailAlerts')}
          />
          <PreferenceRow
            label="Sound alerts"
            description="Play short sound on new live bet"
            value={preferences.soundAlerts}
            onChange={() => updatePreference('soundAlerts')}
          />
          <PreferenceRow
            label="Compact tables"
            description="Use tighter row spacing in admin tables"
            value={preferences.compactTables}
            onChange={() => updatePreference('compactTables')}
          />
          <PreferenceRow
            label="Auto-refresh live data"
            description="Keep live bets/score data updated automatically"
            value={preferences.autoRefreshLiveData}
            onChange={() => updatePreference('autoRefreshLiveData')}
          />
          <PreferenceRow
            label="Dark mode preview"
            description="Enable experimental dark style preview"
            value={preferences.darkModePreview}
            onChange={() => updatePreference('darkModePreview')}
            icon={<Moon size={13} className="text-slate-400" />}
          />
        </div>
      </div>

      {/* App Info + Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Info size={15} className="text-accent" /> App Info & Actions
        </h3>
        <div className="space-y-3">
          <InfoRow label="App Name" value="Cricket Bet" />
          <InfoRow label="Version" value="1.0.0" />
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm">
            <p className="text-slate-500 font-medium mb-1">Backend</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-800 font-bold break-all">{backendUrl}</p>
              <button
                onClick={copyBackendUrl}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-accent hover:text-accent"
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent"
            >
              <RefreshCw size={13} /> Reload Admin
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({ label, description, value, onChange, icon = null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">{icon}{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-accent' : 'bg-slate-200'}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${value ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm flex items-center justify-between gap-3">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-bold">{value}</span>
    </div>
  );
}
