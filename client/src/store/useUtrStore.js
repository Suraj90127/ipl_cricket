import { create } from "zustand";
import api from "../services/api";

export const useUtrStore = create((set) => ({

    utrLoading: false,
    utrSuccess: false,
    utrMessage: null,
    error: null,

    // 🔥 SUBMIT UTR (backend: /update-utr)
    submitUTR: async (utrId) => {
        try {
            set({
                utrLoading: true,
                utrSuccess: false,
                error: null,
                utrMessage: null,
            });

            const { data } = await api.post("/update-utr", { utrId });

            set({
                utrLoading: false,
                utrSuccess: true,
                utrMessage: data.message,
            });

            return data;

        } catch (error) {
            set({
                utrLoading: false,
                utrSuccess: false,
                error: error.response?.data?.message || "UTR submit failed",
            });
        }
    },

    // 🔁 RESET
    resetUtr: () => {
        set({
            utrLoading: false,
            utrSuccess: false,
            utrMessage: null,
            error: null,
        });
    }

}));