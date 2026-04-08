import api from './api.js';

export const liveService = {
  scores: () => api.get('/live-scores').then((res) => res.data)
};
