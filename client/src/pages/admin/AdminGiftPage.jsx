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
        <div className=" flex  p-4">

            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg border border-gray-200">

                {/* Heading */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    🎁 Create Gift Code
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Amount */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full mt-2 px-4 py-2.5 rounded-xl text-gray-700 border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                            required
                        />
                    </div>

                    {/* Users */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Total Users
                        </label>
                        <input
                            type="number"
                            value={totalUsers}
                            onChange={(e) => setTotalUsers(e.target.value)}
                            placeholder="Number of users"
                            className="w-full mt-2 px-4 py-2.5 text-gray-700 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                            required
                        />
                    </div>

                    {/* Expiry */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Expiry Date
                        </label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full mt-2 px-4 py-2.5 rounded-xl border text-gray-700 border-gray-300 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold hover:opacity-90 transition"
                    >
                        {loading ? 'Creating...' : 'Create Code'}
                    </button>

                    {/* Success */}
                    {success && (
                        <div className="text-green-500 text-sm text-center font-medium">
                            {success}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}