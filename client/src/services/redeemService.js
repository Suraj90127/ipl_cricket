import api from './api.js';

export const redeemService = {
  createCode: (payload) =>
    api.post('/admin/create-code', payload).then((res) => res.data),
};