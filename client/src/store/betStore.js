import { create } from 'zustand';
import { betService } from '../services/betService.js';
import { useWalletStore } from './walletStore.js';
import { useAuthStore } from './authStore.js';

export const useBetStore = create((set) => ({
  bets: [],
  loading: false,
  stats: null,
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 1,
  fetchStats: async () => {
    set({ loading: true });
    try {
      const data = await betService.stats();
      set({ stats: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      return null;
    }
  },
  fetchBets: async (filters) => {
    set({ loading: true });
    const data = await betService.list(filters);
    if (Array.isArray(data)) {
      const fallbackLimit = Number(filters?.limit) || data.length || 50;
      set({
        bets: data,
        total: data.length,
        page: Number(filters?.page) || 1,
        limit: fallbackLimit,
        totalPages: 1,
        loading: false
      });
      return;
    }

    set({
      bets: data.bets ?? [],
      total: data.total ?? (data.bets?.length || 0),
      page: data.page ?? Number(filters?.page) ?? 1,
      limit: data.limit ?? Number(filters?.limit) ?? 50,
      totalPages: data.totalPages ?? 1,
      loading: false
    });
  },
  placeBet: async (payload) => {
    const data = await betService.place(payload);
    const betAmount = Math.max(0, Number(payload?.amount) || 0);
    set((state) => ({ bets: [data.bet, ...state.bets] }));

    if (betAmount > 0) {
      useWalletStore.setState((state) => ({
        balance: Math.max(0, Number(state.balance ?? 0) - betAmount)
      }));

      useAuthStore.setState((state) => {
        if (!state.user) return {};
        const currentBalance = Number(state.user.balance ?? 0);
        return {
          user: {
            ...state.user,
            balance: Math.max(0, currentBalance - betAmount)
          }
        };
      });
    }

    return data.bet;
  }
}));
