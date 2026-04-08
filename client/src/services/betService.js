import api from './api.js';

export const betService = {
  place: (payload) => api.post('/bet', payload).then((res) => res.data),
  list: (params) => api.get('/bets', { params }).then((res) => res.data),
  stats: () => api.get('/bets/stats').then((res) => res.data)
};
