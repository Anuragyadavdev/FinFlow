import axiosClient from './axiosClient';

export const goalApi = {
  getAll: () => axiosClient.get('/goals').then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/goals/${id}`).then((r) => r.data.data),
  create: (p) => axiosClient.post('/goals', p).then((r) => r.data.data),
  update: (id, p) => axiosClient.put(`/goals/${id}`, p).then((r) => r.data.data),
  addProgress: (id, amount) =>
    axiosClient
      .patch(`/goals/${id}/progress`, { amount })
      .then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/goals/${id}`).then((r) => r.data),
};