import { create } from "zustand";
import api from "../services/api";

export const useUpiStore = create((set) => ({

  loading: false,
  qrData: null,
  success: false,
  error: null,

  // 🔥 Generate QR
  generateQR: async (amount) => {
    try {
      set({ loading: true, error: null, success: false });

      const { data } = await api.post("/upi-pay", { amount });

      set({
        qrData: data, // full backend response
        loading: false,
        success: true,
      });

    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "QR generation failed",
        success: false,
      });
    }
  },

  // 🔁 Reset (important for modal close)
  reset: () => {
    set({
      loading: false,
      qrData: null,
      success: false,
      error: null,
    });
  }

}));