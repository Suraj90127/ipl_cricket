import { useEffect, useState } from "react";
import useUpiStore from "../../store/adminUpiStore";

const UpiSettingsPage = () => {
    const { upi, getUpiDetails, updateUpiDetails, loading, error } = useUpiStore();

    const [formData, setFormData] = useState({
        upiId: "",
        upiName: "",
    });

    // 🔹 Fetch existing UPI
    useEffect(() => {
        getUpiDetails();
    }, []);

    // 🔹 Autofill when data comes
    useEffect(() => {
        if (upi) {
            setFormData({
                upiId: upi.upiId || "",
                upiName: upi.upiName || "",
            });
        }
    }, [upi]);

    // 🔹 Handle change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 🔹 Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateUpiDetails(formData);
            alert("UPI updated successfully ✅");
        } catch (err) {
            alert("Something went wrong ❌");
        }
    };

    return (
        <div className="bg-white text-black flex px-4 min-h-screen">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">

                <h2 className="text-xl font-bold mb-6 text-center">
                    Update UPI Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 ">

                    {/* UPI ID */}
                    <div>
                        <label className="text-xs text-black/50 block mb-1">
                            UPI ID
                        </label>
                        <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleChange}
                            placeholder="example@upi"
                            className="w-full px-4 py-2 rounded-xl bg-black/10 border border-white/10 outline-none focus:border-teal-400"
                        />
                    </div>

                    {/* UPI Name */}
                    <div>
                        <label className="text-xs text-black/50 block mb-1">
                            UPI Name
                        </label>
                        <input
                            type="text"
                            name="upiName"
                            value={formData.upiName}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full px-4 py-2 rounded-xl bg-black/10 border border-white/10 outline-none focus:border-teal-400"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 transition font-semibold"
                    >
                        {loading ? "Updating..." : "Update UPI"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpiSettingsPage;