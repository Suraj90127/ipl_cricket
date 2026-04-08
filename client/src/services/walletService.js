import api from './api.js';

export const walletService = {
  recharge: (payload) => api.post('/recharge', payload).then((res) => res.data),
  withdraw: (payload) => api.post('/withdraw', payload).then((res) => res.data),
  transactions: (params) => api.get('/transactions', { params }).then((res) => res.data),
  getPaymentMethods: () => api.get('/payment-methods').then(res => res.data),
  addPaymentMethod: (payload) => api.post('/payment-methods', payload).then(res => res.data),
};
