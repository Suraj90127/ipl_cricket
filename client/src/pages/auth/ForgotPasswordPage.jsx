import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-6 py-12">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your email to receive OTP</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-6">
            Send OTP
          </button>
          {sent && <p className="text-sm text-green-600 font-medium text-center">✓ OTP sent! (mock)</p>}
        </form>
        <div className="text-sm text-center text-gray-500 mt-6">
          Back to <Link to="/login" className="text-accent hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
}
