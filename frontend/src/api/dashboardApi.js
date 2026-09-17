import axiosClient from './axiosClient';

export const dashboardApi = {
  getSummary: () =>
    axiosClient.get('/dashboard').then((r) => r.data.data),
};