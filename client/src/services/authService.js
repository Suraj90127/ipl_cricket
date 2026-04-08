import api from './api.js';

export const authService = {
  signup: (payload) => api.post('/signup', payload).then((res) => res.data),
  login: (payload) => api.post('/login', payload).then((res) => res.data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me').then((res) => res.data),
  updateMe: (payload) => api.patch('/me', payload).then((res) => res.data),
  claimDaily: () => api.post('/claim-daily').then((res) => res.data)
};
