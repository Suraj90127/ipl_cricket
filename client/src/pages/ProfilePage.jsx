import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { User, Copy, Gift, Award, Phone, Mail, LogOut, ChevronRight, X, Headset, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, updateProfile, claimDaily } = useAuthStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
   
    phone: user?.phone || '',
    password: ''
  });

  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  // Check if already claimed today
  const canClaim = !user.lastDailyClaim || (new Date(user.lastDailyClaim)).toDateString() !== (new Date()).toDateString();

  const handleClaim = async () => {
    setClaiming(true);
    setClaimMsg('');
    try {
      await claimDaily();
      setClaimMsg('₹5 daily bonus claimed!');
    } catch (err) {
      setClaimMsg(err?.response?.data?.message || 'Already claimed today');
    } finally {
      setClaiming(false);
    }
  };
  if (!user) return null;

  const supportPhone = '+919999999999';
  const supportEmail = 'support@cricketbet.app';
  const whatsappMessage = encodeURIComponent('Hi team, I need help with my account.');

  const handleCopyReferral = async () => {
    if (!user?.referralCode) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert('Could not copy code');
    }
  };

  const handleCopyReferralLink = async () => {
    if (!user?.referralCode) return;
    try {
      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1200);
    } catch {
      alert('Could not copy link');
    }
  };

  const openSettings = () => {
    setForm({
      name: user?.name || '',
     
      phone: user?.phone || '',
      password: ''
    });
    setMessage('');
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({
        name: form.name.trim(),
      
        phone: form.phone.trim(),
        ...(form.password ? { password: form.password } : {})
      });
      setForm((prev) => ({ ...prev, password: '' }));
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
   window.scrollTo(0, 0);
  }, [user]);
  return (
    <div className="space-y-6 pt-2  max-w-lg mx-auto">
      {/* Profile Header */}
     <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 text-white shadow-xl">

  {/* glow effect */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 blur-3xl rounded-full"></div>

  <div className="relative flex items-center gap-5">

    {/* avatar */}
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] shadow-lg">
      <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
        <User size={34} className="text-white" />
      </div>
    </div>

    {/* user info */}
    <div className="flex flex-col">

      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded w-fit mb-1">
        UID: {user.uid || 'N/A'}
      </span>

      <h2 className="text-2xl font-bold tracking-tight">
        {user.name}
      </h2>

      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
        <Phone size={14} />
        {user.phone}
      </div>

    </div>

  </div>

</div>

      {/* Rewards Section */}
      <div className="glass p-5 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] pointer-events-none -ml-10 -mt-10"></div>
        
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4 relative z-10">
          <Gift className="text-amber-500" size={20} /> Rewards & Bonuses
        </h3>
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral Code</p>
                <p className="font-bold text-slate-800 text-sm">{user.referralCode ?? 'COMING SOON'}</p>
              </div>
            </div>
            <button onClick={handleCopyReferral} className="p-2 text-slate-400 hover:text-accent hover:bg-indigo-50 rounded-xl transition-colors">
              <Copy size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                <ExternalLink size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral Link</p>
                <p className="font-bold text-slate-600 text-xs truncate">
                  {user.referralCode ? `${window.location.origin}/signup?ref=...` : 'COMING SOON'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleCopyReferralLink}
              disabled={!user?.referralCode}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-30"
            >
              {linkCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                <Gift size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Bonus</p>
                <p className="font-bold text-emerald-500 text-sm">+₹{user.dailyBonus ?? 0}</p>
              </div>
            </div>
            <button
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              onClick={handleClaim}
              disabled={!canClaim || claiming}
            >
              {claiming ? 'Claiming...' : canClaim ? 'Claim' : 'Claimed'}
            </button>
          </div>

          {claimMsg && (
            <p className="text-xs font-semibold text-center text-emerald-600 mt-1">{claimMsg}</p>
          )}

          <p className="text-xs font-semibold text-slate-500 text-center mt-3 bg-slate-50 p-2 rounded-xl">
            Invite friends to earn a huge bonus on every win!
          </p>
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="glass p-2 rounded-3xl border border-white/60 shadow-sm">
        <button onClick={openSettings} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white transition-colors group">
          <span className="font-bold text-slate-700">Account Settings</span>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-transform" />
        </button>
        <button onClick={() => setSupportOpen(true)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white transition-colors group">
          <span className="font-bold text-slate-700">Support / Help</span>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-colors group"
        >
          <span className="font-bold text-red-500 flex items-center gap-2"><LogOut size={16} /> Logout</span>
        </button>
      </div>

      {copied && (
        <p className="text-xs font-bold text-emerald-600 text-center">Referral code copied</p>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Account Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} />
            
              <Field label="Phone" value={form.phone} onChange={(v) => setForm((s) => ({ ...s, phone: v }))} />
              <Field label="New Password (optional)" type="password" value={form.password} onChange={(v) => setForm((s) => ({ ...s, password: v }))} />
              {message && <p className={`text-xs font-semibold ${message.toLowerCase().includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>}
            </div>
            <div className="p-4 pt-0 flex gap-2">
              <button onClick={() => setSettingsOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500">Close</button>
              <button onClick={saveSettings} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {supportOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Headset size={16} className="text-accent" /> Support / Help</h3>
              <button onClick={() => setSupportOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-2">
              <a href={`tel:${supportPhone}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-accent hover:bg-slate-50">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={14} /> Call Support</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
              <a href={`mailto:${supportEmail}?subject=Cricket%20Bet%20Support`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-accent hover:bg-slate-50">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={14} /> Email Support</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
              <a href={`https://wa.me/${supportPhone.replace(/[^\d]/g, '')}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-accent hover:bg-slate-50">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><MessageCircle size={14} /> WhatsApp Chat</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
              <button onClick={() => navigate('/wallet')} className="w-full text-left flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-accent hover:bg-slate-50">
                <span className="text-sm font-bold text-slate-700">Recharge/Withdraw Help</span>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block text-sm space-y-1">
      <span className="text-slate-500 font-semibold text-xs">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-accent"
      />
    </label>
  );
}
