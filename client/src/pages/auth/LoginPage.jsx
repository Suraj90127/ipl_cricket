import { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      phone,
      password
    };

    try {
      await login(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials1111');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 p-[2px] mb-4 shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-[#0b1220] rounded-[22px] flex items-center justify-center">
              <LogIn size={32} className="text-teal-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-white/40 font-medium mt-2">Sign in to start placing your bets</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/10 focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/10 focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold py-4 rounded-2xl shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-white/40 text-sm font-bold">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-400 hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}