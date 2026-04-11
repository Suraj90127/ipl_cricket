import React, { useEffect } from 'react';
import { useRedeemStore } from '../../store/redeemStore';
import { FcExpired } from "react-icons/fc";
import { IoIosCreate } from "react-icons/io";

const AdminRedeemed = () => {
    const { codes, getAllCodes, loading, error } = useRedeemStore();

    useEffect(() => {
        getAllCodes();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Redeem Codes
            </h2>

            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {codes?.map((item) => {
                    const usedCount = item.usedBy?.length || 0;
                    const percentage = item.totalUsers
                        ? (usedCount / item.totalUsers) * 100
                        : 0;

                    return (
                        <div
                            key={item._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition duration-300"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {item.code}
                                </h3>

                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                        item.isActive
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-500'
                                    }`}
                                >
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Amount */}
                            <p className="text-sm text-gray-600">
                                Amount: <span className="font-medium">₹{item.amount}</span>
                            </p>

                            {/* Usage */}
                            <p className="text-sm text-gray-600">
                                Used: {usedCount} / {item.totalUsers}
                            </p>

                            {/* People Left */}
                            <p className="text-sm text-gray-600 mb-3">
                                People Left: {item.peopleLeft}
                            </p>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* Dates */}
                            {/* Dates */}
<div className="flex justify-between items-center text-xs mt-3">
    <p className="text-orange-500 font-medium flex gap-1">
        <FcExpired size={18}/> Expires:{" "}
        <span className="text-orange-400 font-normal">
            {new Date(item.expiresAt).toLocaleString()}
        </span>
    </p>

    <p className="text-blue-500 font-medium flex gap-1">
        <IoIosCreate  size={18}/> Created:{" "}
        <span className="text-gray-500 font-normal">
            {new Date(item.createdAt).toLocaleString()}
        </span>
    </p>
</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminRedeemed;