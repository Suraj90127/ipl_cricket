import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { UserPlus, ArrowRight, Loader } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    referralCode: searchParams.get('ref') || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 relative overflow-hidden my-4 sm:my-8 lg:my-0">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -ml-40 -mb-20"></div>

      <div className="max-w-[400px] w-full mx-auto relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center mx-auto mb-6 relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur group-hover:bg-accent/30 transition-all"></div>
            <UserPlus size={32} className="text-accent relative z-10 ml-1" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Join us to start predicting & winning</p>
        </div>
        
        <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 rounded-[2rem] shadow-premium border border-white/60 space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter your phone number" />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 6 characters"
          />
          <Input
            label="Referral / Promo Code (optional)"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
            placeholder="Enter referral or promo code"
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 mt-2 rounded-xl border border-red-100 text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary py-3.5 mt-6 text-base font-bold shadow-float group"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={20} /> Creating...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            )}
          </button>
        </form>
        
        <div className="text-center mt-8 text-sm font-medium text-slate-600 pb-8 lg:pb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:underline decoration-2 underline-offset-4">
            Log in to account
          </Link>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', ...rest }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</span>
      <input
        type={type}
        className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all shadow-sm"
        {...rest}
      />
    </label>
  );
}
