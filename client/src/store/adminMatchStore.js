import { create } from 'zustand';
import { matchService } from '../services/matchService'; 

export const useAdminMatchStore = create((set, get) => ({
    matches: [],
    loading: false,
    error: null,

    // 🔥 Delete Match
    deleteMatch: async (matchId) => {
        set({ loading: true, error: null });

        try {
            await matchService.deleteMatch(matchId);

            // ✅ UI se bhi remove kar do
            set((state) => ({
                matches: state.matches.filter((m) => m._id !== matchId),
                loading: false
            }));

            return true;
        } catch (err) {
            set({
                error: err?.message || 'Failed to delete match',
                loading: false
            });
            return false;
        }
    }
}));