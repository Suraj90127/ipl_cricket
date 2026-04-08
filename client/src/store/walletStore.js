import { create } from 'zustand';
import { walletService } from '../services/walletService.js';

export const useWalletStore = create((set) => ({
  balance: 0,
  transactions: [],
  total: 0,
  totalPages: 1,
  paymentMethods: [],
  setBalance: (balance) => set({ balance }),
  fetchTransactions: async (params) => {
    const data = await walletService.transactions(params);
    set({
      balance: data.balance ?? 0,
      transactions: data.transactions ?? [],
      total: data.total ?? 0,
      totalPages: data.totalPages ?? 1
    });
  },
  recharge: async (amount) => {
    const data = await walletService.recharge({ amount });
    set((state) => ({
      balance: data.balance ?? state.balance + Number(amount),
      transactions: [data.transaction, ...state.transactions]
    }));
  },
  withdraw: async (payload) => {
    const data = await walletService.withdraw(payload);
    set((state) => ({
      balance: data.balance ?? state.balance - Number(payload.amount),
      transactions: [data.transaction, ...state.transactions]
    }));
  },
  fetchPaymentMethods: async () => {
    const data = await walletService.getPaymentMethods();
    set({ paymentMethods: data });
  },
  addPaymentMethod: async (payload) => {
    const data = await walletService.addPaymentMethod(payload);
    set((state) => ({ paymentMethods: [...state.paymentMethods, data] }));
  }
}));
