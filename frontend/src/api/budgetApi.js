import axiosClient from './axiosClient';

export const budgetApi = {
  getAll: () => axiosClient.get('/budgets').then((r) => r.data.data),
  getActive: () => axiosClient.get('/budgets/active').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/budgets/${id}`).then((r) => r.data.data),
  create: (p) => axiosClient.post('/budgets', p).then((r) => r.data.data),
  update: (id, p) => axiosClient.put(`/budgets/${id}`, p).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/budgets/${id}`).then((r) => r.data),
};