import React, { useState } from 'react';
import { useRedeemStore } from '../store/redeemStore';

const RedeemPage = () => {
  const [code, setCode] = useState('');
  const { redeemCode, loading, success, error } = useRedeemStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    redeemCode(code);
  };

  return (
   <div className="flex flex-col">
  
  <form onSubmit={handleSubmit} className="flex items-center gap-2">
    
    <input
      type="text"
      placeholder="Redeem"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="h-8 px-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none w-52"
    />

    <button
      type="submit"
      disabled={loading}
      className="h-8 px-3 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold rounded-lg hover:bg-emerald-600 transition"
    >
      {loading ? 'Loading' : 'Claim'}
    </button>

  </form>

  {/* 👇 MESSAGE BELOW */}
  {success && (
  <span className="text-xs text-green-400 mt-1">
    {success.message}
  </span>
)}

{error && (
  <span className="text-xs text-red-400 mt-1">
    {error}
  </span>
)}

</div>
  );
};

export default RedeemPage;