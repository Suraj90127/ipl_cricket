import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { User, Copy, Gift, Award, Phone, Mail, LogOut, ChevronRight, X, Headset, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RedeemPage from './RedeemPage.jsx';

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
    <div className="space-y-6 pt-2 bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f]  px-4 pb-28 min-h-screen relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>

      {/* Profile Header */}
     <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 text-white shadow-xl max-w-lg mx-auto">

  {/* glow effect */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full"></div>

  <div className="relative flex items-center gap-5">

    {/* avatar */}
    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 p-[3px] shadow-lg">
      <div className="w-full h-full bg-[#0b1220] rounded-full flex items-center justify-center">
        <User size={34} className="text-white" />
      </div>
    </div>

    {/* user info */}
    <div className="flex flex-col relative z-10">

      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded w-fit mb-1">
        UID: {user.uid || 'N/A'}
      </span>

      <h2 className="text-2xl font-bold tracking-tight">
        {user.name}
      </h2>

      <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
        <Phone size={14} />
        {user.phone}
      </div>

    </div>

  </div>

</div>

      {/* Rewards Section */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group max-w-lg mx-auto">
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] pointer-events-none -ml-10 -mt-10"></div>
        
        <h3 className="font-bold text-white text-lg flex items-center gap-2 mb-4 relative z-10">
          <Gift className="text-teal-400" size={20} /> Rewards & Bonuses
        </h3>
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 text-teal-400 rounded-xl">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Referral Code</p>
                <p className="font-bold text-white text-sm">{user.referralCode ?? 'COMING SOON'}</p>
              </div>
            </div>
            <button onClick={handleCopyReferral} className="p-2 text-white/40 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors">
              <Copy size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 text-cyan-400 rounded-xl">
                <ExternalLink size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Referral Link</p>
                <p className="font-bold text-white/60 text-xs truncate">
                  {user.referralCode ? `${window.location.origin}/signup?ref=...` : 'COMING SOON'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleCopyReferralLink}
              disabled={!user?.referralCode}
              className="p-2 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30"
            >
              {linkCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
  <div className="flex items-center gap-3">
    
    <div className="p-2 bg-white/10 text-emerald-400 rounded-xl">
      <Gift size={18} />
    </div>

    {/* IMPORTANT: flex + items-center */}
    <div className="flex items-center">
      <RedeemPage />
    </div>

  </div>
</div>

          {claimMsg && (
            <p className="text-xs font-semibold text-center text-emerald-600 mt-1">{claimMsg}</p>
          )}

          <p className="text-xs font-semibold text-white/40 text-center mt-3 bg-white/5 p-3 rounded-2xl border border-white/5 leading-relaxed">
            Invite friends to earn a huge bonus on every win!
          </p>
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="bg-white/5 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-lg max-w-lg mx-auto">
        <button onClick={openSettings} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group text-white/80">
          <span className="font-bold">Account Settings</span>
          <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-transform" />
        </button>
        <button onClick={() => setSupportOpen(true)} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group text-white/80">
          <span className="font-bold">Support / Help</span>
          <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/10 transition-colors group"
        >
          <span className="font-bold text-red-500 flex items-center gap-2"><LogOut size={16} /> Logout</span>
        </button>
      </div>

      {copied && (
        <p className="text-xs font-bold text-emerald-400 text-center animate-bounce">Referral code copied</p>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0b1220] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white">Account Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} />
            
              <Field label="Phone" value={form.phone} onChange={(v) => setForm((s) => ({ ...s, phone: v }))} />
              <Field label="New Password (optional)" type="password" value={form.password} onChange={(v) => setForm((s) => ({ ...s, password: v }))} />
              {message && <p className={`text-xs font-semibold ${message.toLowerCase().includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setSettingsOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/60 hover:bg-white/10 transition">Close</button>
              <button onClick={saveSettings} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black text-sm font-bold shadow-lg shadow-teal-500/20 disabled:opacity-30 transition">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {supportOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0b1220] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2"><Headset size={18} className="text-teal-400" /> Support / Help</h3>
              <button onClick={() => setSupportOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              <a href={`tel:${supportPhone}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <span className="text-sm font-bold text-white/80 flex items-center gap-2"><Phone size={16} className="text-teal-400" /> Call Support</span>
                <ExternalLink size={14} className="text-white/30" />
              </a>
              <a href={`mailto:${supportEmail}?subject=Cricket%20Bet%20Support`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <span className="text-sm font-bold text-white/80 flex items-center gap-2"><Mail size={16} className="text-cyan-400" /> Email Support</span>
                <ExternalLink size={14} className="text-white/30" />
              </a>
              <a href={`https://wa.me/${supportPhone.replace(/[^\d]/g, '')}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <span className="text-sm font-bold text-white/80 flex items-center gap-2"><MessageCircle size={16} className="text-emerald-400" /> WhatsApp Chat</span>
                <ExternalLink size={14} className="text-white/30" />
              </a>
              <button onClick={() => navigate('/wallet')} className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <span className="text-sm font-bold text-white/80">Recharge/Withdraw Help</span>
                <ChevronRight size={16} className="text-white/30" />
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
      <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400/50 transition"
      />
    </label>
  );
}
