import api from './api.js';

export const matchService = {
  list: (params) => api.get('/matches', { params }).then((res) => res.data),
  get: (id) => api.get(`/match/${id}`).then((res) => res.data),
  questions: (matchId) => api.get(`/questions/${matchId}`).then((res) => res.data)
};
