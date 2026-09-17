import axiosClient from './axiosClient';

export const analyticsApi = {
  currentMonth: () =>
    axiosClient.get('/analytics/summary').then((r) => r.data.data),

  lastMonths: (months = 6) =>
    axiosClient.get(`/analytics/summary/months/${months}`).then((r) => r.data.data),

  range: (start, end) =>
    axiosClient
      .get('/analytics/summary/range', { params: { start, end } })
      .then((r) => r.data.data),
};