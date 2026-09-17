import axiosClient from './axiosClient';

export const investmentApi = {
  getAll: () => axiosClient.get('/investments').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/investments/${id}`).then((r) => r.data.data),
  create: (p) => axiosClient.post('/investments', p).then((r) => r.data.data),
  update: (id, p) => axiosClient.put(`/investments/${id}`, p).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/investments/${id}`).then((r) => r.data),
};