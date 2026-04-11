import { create } from 'zustand';
import { redeemService } from '../services/redeemService.js';
import api from '../services/api';

export const useRedeemStore = create((set) => ({
  loading: false,
  error: null,
  success: null,
  data: null, // 🔥 response store karne ke liye

  // 🎁 ADMIN → Create Code
  createRedeem: async (payload) => {
    set({ loading: true, error: null, success: null });

    try {
      const res = await redeemService.createCode(payload);

      set({
        loading: false,
        success: 'Code created successfully',
      });

      return res;
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || 'Failed to create code',
      });
      return null;
    }
  },

  // 🎟 USER → Redeem Code (🔥 UPDATED)
  redeemCode: async (code) => {
    set({ loading: true, error: null, success: null, data: null });

    try {
      const res = await api.post(
        '/redeem',
        { code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // 🔥 backend se jo aa raha hai
      const response = res.data;

      set({
        loading: false,
        success: response.message,
        data: {
          creditedAmount: response.creditedAmount,
          newBalance: response.newBalance,
          peopleLeft: response.peopleLeft,
        },
      });

      return response;
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || 'Redeem failed',
      });

      return null;
    }
  },
}));