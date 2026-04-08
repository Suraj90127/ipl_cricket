import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService.js';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  token: null,
  user: null,
  isReady: false
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      login: async (payload) => {
        const data = await authService.login(payload);
        set({ token: data.token, user: data.user, isReady: true });
      },
      signup: async (payload) => {
        const data = await authService.signup(payload);
        set({ token: data.token, user: data.user, isReady: true });
        // Sync wallet balance
        try {
          const { useWalletStore } = await import('./walletStore.js');
          useWalletStore.getState().setBalance(data.user.balance ?? 0);
        } catch {}
      },
      loadUserFromToken: async () => {
        const token = get().token;
        if (!token) {
          set({ isReady: true });
          return;
        }
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            set(initialState);
            return;
          }
          const user = await authService.me();
          set({ user, isReady: true });
          // Sync wallet balance
          try {
            const { useWalletStore } = await import('./walletStore.js');
            useWalletStore.getState().setBalance(user.balance ?? 0);
          } catch {}
        } catch (e) {
          set(initialState);
        }
      },
      updateProfile: async (payload) => {
        const user = await authService.updateMe(payload);
        set({ user });
        try {
          const { useWalletStore } = await import('./walletStore.js');
          useWalletStore.getState().setBalance(user.balance ?? 0);
        } catch {}
        return user;
      },
      claimDaily: async () => {
        const data = await authService.claimDaily();
        // Refresh user info after claim
        const user = await authService.me();
        set({ user });
        try {
          const { useWalletStore } = await import('./walletStore.js');
          useWalletStore.getState().setBalance(user.balance ?? 0);
        } catch {}
        return data;
      },
      logout: () => {
        set(initialState);
        authService.logout().catch(() => {});
      }
    }),
    { name: 'auth-storage' }
  )
);
