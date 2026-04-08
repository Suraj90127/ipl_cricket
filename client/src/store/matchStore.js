import { create } from 'zustand';
import { matchService } from '../services/matchService.js';

export const useMatchStore = create((set, get) => ({
  matches: [],
  selectedMatch: null,
  questions: [],
  loading: false,
  fetchMatches: async (status) => {
    set({ loading: true });
    const data = await matchService.list({ status });
    set({ matches: data.matches ?? data, loading: false });
  },
  fetchMatch: async (id) => {
    set({ loading: true });
    const data = await matchService.get(id);
    set({ selectedMatch: data, loading: false });
  },
  fetchQuestions: async (matchId) => {
    const data = await matchService.questions(matchId);
    set({ questions: data.questions ?? data });
  },
  upsertMatchScore: (matchId, team, score) => {
    const updateField = team === 'A' ? 'teamAScore' : 'teamBScore';
    const updated = get().matches.map((m) =>
      m._id === matchId ? { ...m, [updateField]: score } : m
    );
    set({ matches: updated });
    if (get().selectedMatch?._id === matchId) {
      set({ selectedMatch: { ...get().selectedMatch, [updateField]: score } });
    }
  },

  upsertQuestion: (question) => {
    // Update or insert question in questions array
    const questions = get().questions;
    const idx = questions.findIndex((q) => q._id === question._id);
    let updated;
    if (idx !== -1) {
      updated = [...questions];
      updated[idx] = { ...questions[idx], ...question };
    } else {
      updated = [...questions, question];
    }
    set({ questions: updated });
    // Also update in selectedMatch if present
    if (get().selectedMatch) {
      const match = get().selectedMatch;
      if (Array.isArray(match.questions)) {
        const qidx = match.questions.findIndex((q) => q._id === question._id);
        let matchQuestions;
        if (qidx !== -1) {
          matchQuestions = [...match.questions];
          matchQuestions[qidx] = { ...match.questions[qidx], ...question };
        } else {
          matchQuestions = [...match.questions, question];
        }
        set({ selectedMatch: { ...match, questions: matchQuestions } });
      }
    }
  }
}));
