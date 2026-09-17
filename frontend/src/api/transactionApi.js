import axiosClient from './axiosClient';

export const transactionApi = {
  getAll: (params) =>
    axiosClient.get('/transactions', { params }).then((r) => r.data.data),

  getById: (id) =>
    axiosClient.get(`/transactions/${id}`).then((r) => r.data.data),

  create: (payload) =>
    axiosClient.post('/transactions', payload).then((r) => r.data.data),

  update: (id, payload) =>
    axiosClient.put(`/transactions/${id}`, payload).then((r) => r.data.data),

  remove: (id) =>
    axiosClient.delete(`/transactions/${id}`).then((r) => r.data),

  recent: (limit = 10) =>
    axiosClient
      .get('/transactions/recent', { params: { limit } })
      .then((r) => r.data.data),
};