import { create } from 'zustand';
import { redeemService } from '../services/redeemService.js';

export const useRedeemStore = create((set) => ({
  loading: false,
  error: null,
  success: null,

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
}));