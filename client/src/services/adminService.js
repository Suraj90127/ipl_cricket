import api from './api.js';

export const adminService = {
  // existing
  addMatch: (payload) => api.post('/admin/match', payload).then((r) => r.data),
  addQuestion: (payload) => api.post('/admin/question', payload).then((r) => r.data),
  addCategory: (payload) => api.post('/admin/category', payload).then((r) => r.data),
  pushResult: (payload) => api.post('/admin/result', payload).then((r) => r.data),
  updateScore: (payload) => api.post('/admin/score', payload).then((r) => r.data),

  // stats
  getStats: () => api.get('/admin/stats').then((r) => r.data),

  // users
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getUserDetails: (id) => api.get(`/admin/users/${id}/details`).then((r) => r.data),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`).then((r) => r.data),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`).then((r) => r.data),
  adjustWallet: (id, payload) => api.patch(`/admin/users/${id}/wallet`, payload).then((r) => r.data),

  // bets
  getBets: (params) => api.get('/admin/bets', { params }).then((r) => r.data),
  getLiveBets: (params) => api.get('/admin/live-bets', { params }).then((r) => r.data),
  getLiveQuestions: (params) => api.get('/admin/live-questions', { params }).then((r) => r.data),

  // matches
  getMatches: (params) => api.get('/admin/matches', { params }).then((r) => r.data),
  getAllMatches: () => api.get('/admin/matches', { params: { limit: 10000 } }).then((r) => r.data.matches ?? []),
  updateMatch: (id, payload) => api.patch(`/admin/matches/${id}`, payload).then((r) => r.data),
  deleteMatch: (id) => api.delete(`/admin/matches/${id}`).then((r) => r.data),

  // questions
  getQuestions: (params) => api.get('/admin/questions', { params }).then((r) => r.data),
  updateQuestion: (id, payload) => api.patch(`/admin/questions/${id}`, payload).then((r) => r.data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`).then((r) => r.data),
  createTemplates: (matchId, payload) => api.post(`/questions/${matchId}/templates`, payload).then((r) => r.data),
  bulkUpdateQuestions: (payload) => api.post('/admin/questions/bulk-update', payload).then((r) => r.data),
  uploadImage: (formData) => api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  // settings (public GET, admin PATCH)
  getSettings: () => api.get('/settings').then((r) => r.data),
  saveSettings: (payload) => api.patch('/admin/settings', payload).then((r) => r.data),

  // transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }).then((r) => r.data),
  updateTransaction: (id, payload) => api.patch(`/admin/transactions/${id}`, payload).then((r) => r.data),
};
