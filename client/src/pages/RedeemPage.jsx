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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Redeem Code</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter redeem code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            {loading ? 'Redeeming...' : 'Redeem'}
          </button>
        </form>

        {/* SUCCESS */}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            <p>{success.message}</p>
            <p>Amount: ₹{success.creditedAmount}</p>
            <p>Balance: ₹{success.newBalance}</p>
            <p>People Left: {success.peopleLeft}</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemPage;
