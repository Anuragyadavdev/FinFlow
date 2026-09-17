import axiosClient from './axiosClient';

export const accountApi = {
  getAll: () => axiosClient.get('/accounts').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/accounts/${id}`).then((r) => r.data.data),
  create: (p) => axiosClient.post('/accounts', p).then((r) => r.data.data),
  update: (id, p) => axiosClient.put(`/accounts/${id}`, p).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/accounts/${id}`).then((r) => r.data),
  totalBalance: () => axiosClient.get('/accounts/total-balance').then((r) => r.data.data),
};