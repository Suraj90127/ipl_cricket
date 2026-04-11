import { useState } from 'react';
import { useRedeemStore } from '../../store/redeemStore.js';

export default function AdminGiftPage() {
    const { createRedeem, loading, error, success } = useRedeemStore();

    const [amount, setAmount] = useState('');
    const [totalUsers, setTotalUsers] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            amount: Number(amount),
            totalUsers: Number(totalUsers),
            expiresAt: expiresAt || null,
        };

        const res = await createRedeem(payload);

        if (res) {
            setAmount('');
            setTotalUsers('');
            setExpiresAt('');
        }
    };

    return (
        <div className="min-h-screen p-4">

            <div className="max-w-md bg-gray-200 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-xl">

                <h2 className="text-xl font-bold text-gray-950 mb-6 text-center">
                    🎁 Create Gift Code
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Amount */}
                    <div>
                        <label className="text-xs text-black font-bold">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-200 border border-gray-800 text-black"
                            required
                        />
                    </div>

                    {/* Users */}
                    <div>
                        <label className="text-xs text-black font-bold">Total Users</label>
                        <input
                            type="number"
                            value={totalUsers}
                            onChange={(e) => setTotalUsers(e.target.value)}
                            placeholder="Number of users"
                            className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-200 border border-gray-800 text-black"
                            required
                        />
                    </div>

                    {/* Expiry */}
                    <div>
                        <label className="text-xs text-black font-bold">Expiry Date</label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-gray-800 text-black"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold"
                    >
                        {loading ? 'Creating...' : 'Create Code'}
                    </button>

                    {/* Success */}
                    {success && (
                        <div className="text-emerald-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}