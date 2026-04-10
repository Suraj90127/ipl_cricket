import { create } from "zustand";
import api from "../services/api";

const useUpiStore = create((set) => ({
    upi: null,
    loading: false,
    error: null,

    // 🔹 Get UPI Details
    getUpiDetails: async () => {
        try {
            set({ loading: true, error: null });

            const res = await api.get("/admin/upi"); // adjust endpoint if needed

            set({
                upi: res.data.data,
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message,
                loading: false,
            });
        }
    },

    // 🔹 Update UPI Details (Admin)
    updateUpiDetails: async (data) => {
        try {
            set({ loading: true, error: null });

            const res = await api.put("/admin/update/upi", data); // or PUT if you're using PUT

            set({
                upi: res.data.data,
                loading: false,
            });

            return res.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message,
                loading: false,
            });

            throw error;
        }
    },
}));

export default useUpiStore;