import axiosClient from './axiosClient';

export const anomalyApi = {
  list: (params) => axiosClient.get('/anomalies', { params }).then((r) => r.data.data),
  getById: (id) => axiosClient.get(`/anomalies/${id}`).then((r) => r.data.data),
  unreviewedCount: () =>
    axiosClient.get('/anomalies/unreviewed-count').then((r) => r.data.data),
  review: (id, payload) =>
    axiosClient.patch(`/anomalies/${id}/review`, payload).then((r) => r.data.data),
  scan: () => axiosClient.post('/anomalies/scan').then((r) => r.data.data),
};