import axiosClient from './axiosClient';

export const categoryApi = {
  getAll: (type) =>
    axiosClient
      .get('/categories', { params: type ? { type } : {} })
      .then((r) => r.data.data),
  create: (p) => axiosClient.post('/categories', p).then((r) => r.data.data),
  update: (id, p) => axiosClient.put(`/categories/${id}`, p).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/categories/${id}`).then((r) => r.data),
};