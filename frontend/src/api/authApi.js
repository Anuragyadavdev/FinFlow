import axiosClient from './axiosClient';

export const authApi = {
  register: (payload) =>
    axiosClient.post('/auth/register', payload).then((r) => r.data.data),

  login: (payload) =>
    axiosClient.post('/auth/login', payload).then((r) => r.data.data),

  me: () =>
    axiosClient
      .get('/auth/me', { skipErrorToast: true })
      .then((r) => r.data.data),

  logout: () =>
    axiosClient.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken) =>
    axiosClient
      .post('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),
};