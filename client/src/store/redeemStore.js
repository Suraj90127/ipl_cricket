import { create } from 'zustand';
import api from '../services/api';

export const useRedeemStore = create((set) => ({
  loading: false,
  success: null,
  error: null,

  redeemCode: async (code) => {
    try {
      set({ loading: true, success: null, error: null });

      const res = await api.post('/api/redeem', { code }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      set({
        loading: false,
        success: res.data,
      });

    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Something went wrong',
      });
    }
  },
}));
