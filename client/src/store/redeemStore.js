import { create } from 'zustand';
import { redeemService } from '../services/redeemService.js';
import api from '../services/api';

export const useRedeemStore = create((set) => ({
  loading: false,
  error: null,
  success: null,
  data: null,

  // 🔥 NEW STATE (list ke liye)
  codes: [],
  singleCode: null,

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

  // 🔥 ADMIN → Get All Codes
  getAllCodes: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get('/redeem-codes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      set({
        loading: false,
        codes: res.data.data, // backend ka format
      });

    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || 'Failed to fetch codes',
      });
    }
  },

  // 🔥 ADMIN → Get Single Code
  getCodeById: async (id) => {
    set({ loading: true, error: null, singleCode: null });

    try {
      const res = await api.get(`/redeem-codes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      set({
        loading: false,
        singleCode: res.data.data,
      });

    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || 'Failed to fetch code',
      });
    }
  },

  // 🎟 USER → Redeem Code
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